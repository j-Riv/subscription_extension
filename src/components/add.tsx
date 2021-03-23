import React, { useState, useEffect, useMemo } from 'react';
import {
  Checkbox,
  Text,
  Spinner,
  Stack,
  useData,
  useContainer,
  useLocale,
  useSessionToken,
} from '@shopify/argo-admin-react';
import { Translations, translations, serverUrl } from './config';

// 'Add' mode should allow a user to add the current product to an existing selling plan
// [Shopify admin renders this mode inside a modal container]
function Add() {
  // Information about the product and/or plan your extension is editing.
  // Your extension receives different data in each mode.
  const data = useData<'Admin::Product::SubscriptionPlan::Add'>();

  // The UI your extension renders inside
  const {
    close,
    done,
    setPrimaryAction,
    setSecondaryAction,
  } = useContainer<'Admin::Product::SubscriptionPlan::Add'>();

  // Information about the merchant's selected language. Use this to support multiple languages.
  const locale = useLocale();

  // Use locale to set translations with a fallback
  const localizedStrings: Translations = useMemo(() => {
    return translations[locale] || translations.en;
  }, [locale]);

  // Session token contains information about the current user. Use it to authenticate calls
  // from your extension to your app server.
  const { getSessionToken } = useSessionToken();
  const [error, setError] = useState<boolean>(false);
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);

  // Get All Plans
  const getAllPlans = async () => {
    const token = await getSessionToken();
    try {
      const response = await fetch(`${serverUrl}/subscription-plan/all`, {
        method: 'POST',
        headers: {
          'X-SUAVESCRIBE-TOKEN': token || 'unknown token',
        },
      });
      const planGroups = await response.json();
      const planData = [];
      planGroups.forEach(
        (plans: {
          node: { name: any; id: any; sellingPlans: { edges: any[] } };
        }) => {
          // set state
          planData.push({ name: plans.node.name, id: plans.node.id });
        }
      );
      // set state
      setAllPlans(planData);
    } catch (err) {
      console.log('Handle Error', err);
      setError(true);
    }
  };

  useEffect(() => {
    getAllPlans();
  }, []);

  // Configure the extension container UI
  useEffect(() => {
    // Get Plans
    setPrimaryAction({
      content: 'Add to plan',
      onAction: async () => {
        // Get a fresh session token before every call to your app server.
        const token = await getSessionToken();

        // Here, send the form data to your app server to add the product to an existing plan.

        // Upon completion, call done() to trigger a reload of the resource page
        // and terminate the extension.
        // The product and variant ID's collected from the modal form
        interface AddPayload {
          productId: string;
          variantId?: string;
          selectedPlans: string[];
        }

        let payload: AddPayload = {
          productId: data.productId,
          variantId: data.variantId,
          selectedPlans: selectedPlans,
        };

        // Here, send the form data to your app server to add the product to an existing plan.
        const response = await fetch(
          `${serverUrl}/subscription-plan/product/add`,
          {
            method: 'POST',
            headers: {
              'X-SUAVESCRIBE-TOKEN': token || 'unknown token',
            },
            body: JSON.stringify(payload),
          }
        );
        // If the server responds with an OK status, then refresh the UI and close the modal
        // Upon completion, call done() to trigger a reload of the resource page
        // and terminate the extension.
        if (response.ok) {
          done();
        } else {
          console.log('Handle error.');
          setError(true);
        }

        close();
      },
    });

    setSecondaryAction({
      content: 'Cancel',
      onAction: () => close(),
    });
  }, [
    getSessionToken,
    close,
    done,
    setPrimaryAction,
    setSecondaryAction,
    selectedPlans,
  ]);

  return (
    <>
      <Text size="titleSmall">Add Product to an existing plan or plans.</Text>

      {error && (
        <Text color="error">
          There has been a problem, please try again later...
        </Text>
      )}

      <Stack>
        {allPlans.length > 0
          ? allPlans.map(plan => (
              <Checkbox
                key={plan.id}
                label={plan.name}
                onChange={checked => {
                  const plans = checked
                    ? selectedPlans.concat(plan.id)
                    : selectedPlans.filter(id => id !== plan.id);
                  setSelectedPlans(plans);
                }}
                checked={selectedPlans.includes(plan.id)}
              />
            ))
          : !error && <Spinner />}
      </Stack>
    </>
  );
}

export default Add;
