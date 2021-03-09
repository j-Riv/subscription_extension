import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Button,
  Card,
  Checkbox,
  TextField,
  Text,
  Stack,
  extend,
  render,
  useData,
  useContainer,
  useLocale,
  useSessionToken,
} from '@shopify/argo-admin-react';

interface Translations {
  [key: string]: string;
}

const translations: {
  [locale: string]: Translations;
} = {
  de: {
    hello: 'Guten Tag',
  },
  en: {
    hello: 'Hello',
  },
  fr: {
    hello: 'Bonjour',
  },
};

const serverUrl = 'https://eab73c93d01c.ngrok.io';

function Actions({ onPrimary, onClose, title }) {
  return (
    <Stack spacing="none" distribution="fill">
      <Button title="Cancel" onPress={onClose} />
      <Stack distribution="trailing">
        <Button title={title} onPress={onPrimary} primary />
      </Stack>
    </Stack>
  );
}

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

  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [allPlans, setAllPlans] = useState<any[]>([]);
  const mockPlans = [
    { name: 'Subscription Plan A', id: 'a' },
    { name: 'Subscription Plan B', id: 'b' },
    { name: 'Subscription Plan C', id: 'c' },
  ];

  // Get All Plans
  const getAllPlans = async () => {
    const token = await getSessionToken();
    console.log('GETTING ALL PLANS');
    const response = await fetch(`${serverUrl}/subscription-plan/all`, {
      method: 'POST',
      headers: {
        'X-SUAVESCRIBE-TOKEN': token || 'unknown token',
      },
    });
    const planGroups = await response.json();
    console.log('THE RESPONSE');
    console.log(planGroups);
    const planData = [];
    planGroups.forEach(plans => {
      console.log('Plan: ', plans.node.name);
      console.log('Plan ID: ', plans.node.id);
      // set state
      planData.push({ name: plans.node.name, id: plans.node.id });
      plans.node.sellingPlans.edges.forEach(sellingPlan => {
        console.log('Selling Plan: ', sellingPlan.node.name);
        console.log('Selling Plan ID: ', sellingPlan.node.id);
      });
    });
    // set state
    setAllPlans(planData);
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

        console.log(payload);

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
        console.log(response);
        // If the server responds with an OK status, then refresh the UI and close the modal
        // Upon completion, call done() to trigger a reload of the resource page
        // and terminate the extension.
        if (response.ok) {
          done();
        } else {
          console.log('Handle error.');
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
      <Text size="titleLarge">{localizedStrings.hello}!</Text>
      <Text>
        Add Product id {data.productId} to an existing plan or existing plans
      </Text>

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
          : 'Loading ...'}
      </Stack>
      {/* <Stack>
        {mockPlans.map((plan) => (
          <Checkbox
            key={plan.id}
            label={plan.name}
            onChange={(checked) => {
              const plans = checked
                ? selectedPlans.concat(plan.id)
                : selectedPlans.filter((id) => id !== plan.id);
              setSelectedPlans(plans);
            }}
            checked={selectedPlans.includes(plan.id)}
          />
        ))}
      </Stack> */}
    </>
  );
}

// 'Create' mode should create a new selling plan, and add the current product to it
// [Shopify admin renders this mode inside an app overlay container]
function Create() {
  const data = useData<'Admin::Product::SubscriptionPlan::Create'>();
  const {
    close,
    done,
  } = useContainer<'Admin::Product::SubscriptionPlan::Create'>();

  const locale = useLocale();
  const localizedStrings: Translations = useMemo(() => {
    return translations[locale] || translations.en;
  }, [locale]);

  const { getSessionToken } = useSessionToken();

  // Mock plan settings
  const [planTitle, setPlanTitle] = useState('');
  const [percentageOff, setPercentageOff] = useState('');
  const [deliveryFrequency, setDeliveryFrequency] = useState('');

  const onPrimaryAction = useCallback(async () => {
    const token = await getSessionToken();

    // Here, send the form data to your app server to create the new plan.
    // The product and variant ID's collected from the modal form.
    interface CreatePayload {
      productId: string;
      variantId?: string;
      planTitle: string;
      percentageOff: string;
      deliveryFrequency: string;
    }

    let payload: CreatePayload = {
      productId: data.productId,
      variantId: data.variantId,
      planTitle: planTitle,
      percentageOff: percentageOff,
      deliveryFrequency: deliveryFrequency,
    };

    // Send the form data to your app server to create the new plan.
    const response = await fetch(`${serverUrl}/subscription-plan/create`, {
      method: 'POST',
      headers: {
        'X-SUAVESCRIBE-TOKEN': token || 'unknown token',
      },
      body: JSON.stringify(payload),
    });
    console.log(response);
    // const json = await response.json();
    // console.log('JSON RESPONSE');
    // console.log(json);
    // If the server responds with an OK status, then refresh the UI and close the modal
    if (response.ok) {
      done();
    } else {
      console.log('Handle error.');
    }

    close();
  }, [getSessionToken, done, planTitle, percentageOff, deliveryFrequency]);

  const cachedActions = useMemo(
    () => (
      <Actions
        onPrimary={onPrimaryAction}
        onClose={close}
        title="Create plan"
      />
    ),
    [onPrimaryAction, close]
  );

  useEffect(() => {
    console.log(planTitle, '- has changed');
    console.log(planTitle);
  }, [planTitle]);

  return (
    <>
      <Stack spacing="none">
        <Text size="titleLarge">
          {localizedStrings.hello}! Create subscription plan
        </Text>
      </Stack>

      <Card
        title={`Create subscription plan for Product id ${data.productId}`}
        sectioned
      >
        <TextField
          label="Plan title"
          value={planTitle}
          onChange={setPlanTitle}
        />
      </Card>

      <Card title="Delivery and discount" sectioned>
        <Stack>
          <TextField
            type="number"
            label="Delivery frequency (in weeks)"
            value={deliveryFrequency}
            onChange={setDeliveryFrequency}
          />
          <TextField
            type="number"
            label="Percentage off (%)"
            value={percentageOff}
            onChange={setPercentageOff}
          />
        </Stack>
      </Card>

      {cachedActions}
    </>
  );
}

// 'Remove' mode should remove the current product from a selling plan.
// This should not delete the selling plan.
// [Shopify admin renders this mode inside a modal container]
function Remove() {
  const data = useData<'Admin::Product::SubscriptionPlan::Remove'>();
  const {
    close,
    done,
    setPrimaryAction,
    setSecondaryAction,
  } = useContainer<'Admin::Product::SubscriptionPlan::Remove'>();
  const locale = useLocale();
  const localizedStrings: Translations = useMemo(() => {
    return translations[locale] || translations.en;
  }, [locale]);

  const { getSessionToken } = useSessionToken();

  useEffect(() => {
    setPrimaryAction({
      content: 'Remove from plan',
      onAction: async () => {
        const token = await getSessionToken();

        // Here, send the form data to your app server to remove the product from the plan.
        // The product ID, variant ID, variantIds, and the selling plan group ID
        interface RemovePayload {
          sellingPlanGroupId: string;
          productId: string;
          variantId?: string;
          variantIds?: string[];
        }

        let payload: RemovePayload = {
          sellingPlanGroupId: data.sellingPlanGroupId,
          productId: data.productId,
          variantId: data.variantId,
          variantIds: data.variantIds,
        };

        console.log(payload);

        const response = await fetch(
          `${serverUrl}/subscription-plan/product/remove`,
          {
            method: 'POST',
            headers: {
              'X-SUAVESCRIBE-TOKEN': token || 'unknown token',
            },
            body: JSON.stringify(payload),
          }
        );
        console.log(response);
        // If the server responds with an OK status, then refresh the UI and close the modal
        if (response.ok) {
          console.log('THE REMOVED PRODUCT IDS');
          console.log(response);
          done();
        } else {
          console.log('Handle error.');
        }

        close();
      },
    });

    setSecondaryAction({
      content: 'Cancel',
      onAction: () => close(),
    });
  }, [getSessionToken, done, close, setPrimaryAction, setSecondaryAction]);

  return (
    <>
      <Text size="titleLarge">{localizedStrings.hello}!</Text>
      <Text>
        Remove Product id {data.productId} from Plan group id{' '}
        {data.sellingPlanGroupId}
      </Text>
    </>
  );
}

// 'Edit' mode should modify an existing selling plan.
// Changes should affect other products that have this plan applied.
// [Shopify admin renders this mode inside an app overlay container]
function Edit() {
  const data = useData<'Admin::Product::SubscriptionPlan::Edit'>();
  const [currentPlan, setCurrentPlan] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const locale = useLocale();
  const localizedStrings: Translations = useMemo(() => {
    return translations[locale] || translations.en;
  }, [locale]);

  const { getSessionToken } = useSessionToken();

  const [percentageOff, setPercentageOff] = useState('10');
  const [deliveryFrequency, setDeliveryFrequency] = useState('1');
  const {
    close,
    done,
  } = useContainer<'Admin::Product::SubscriptionPlan::Edit'>();

  // Get Plan to Edit
  const getCurrentPlan = async () => {
    const token = await getSessionToken();
    console.log('GETTING PLAN TO EDIT');
    let payload = {
      sellingPlanGroupId: data.sellingPlanGroupId,
      productId: data.productId,
      variantId: data.variantId,
    };
    const response = await fetch(`${serverUrl}/subscription-plan/get`, {
      method: 'POST',
      headers: {
        'X-SUAVESCRIBE-TOKEN': token || 'unknown token',
      },
      body: JSON.stringify(payload),
    });
    const selectedPlan = await response.json();
    console.log('THE RESPONSE');
    console.log(selectedPlan);
    // set title for now
    // still need to figure out how to grab selling plans
    // set state
    setCurrentPlan(selectedPlan);
    setPlanTitle(selectedPlan.name);
  };

  useEffect(() => {
    getCurrentPlan();
  }, []);

  const onPrimaryAction = useCallback(async () => {
    const token = await getSessionToken();

    // Here, send the form data to your app server to modify the selling plan.
    // The product ID and variant ID collected from the modal form and the selling plan group ID
    interface EditPayload {
      sellingPlanGroupId: string;
      productId: string;
      variantId?: string;
      planTitle: string;
    }

    let payload: EditPayload = {
      sellingPlanGroupId: data.sellingPlanGroupId,
      productId: data.productId,
      variantId: data.variantId,
      planTitle: planTitle,
    };

    // Here, send the form data to your app server to add the product to an existing plan.
    const response = await fetch(`${serverUrl}/subscription-plan/edit`, {
      method: 'POST',
      headers: {
        'X-SUAVESCRIBE-TOKEN': token || 'unknown token',
      },
      body: JSON.stringify(payload),
    });
    console.log(response);
    // If the server responds with an OK status, then refresh the UI and close the modal
    if (response.ok) {
      done();
    } else {
      console.log('Handle error.');
    }
    close();
  }, [getSessionToken, done, planTitle, percentageOff, deliveryFrequency]);

  const cachedActions = useMemo(
    () => (
      <Actions onPrimary={onPrimaryAction} onClose={close} title="Edit plan" />
    ),
    [onPrimaryAction, close]
  );

  return (
    <>
      <Stack spacing="none">
        <Text size="titleLarge">
          {localizedStrings.hello}! Edit subscription plan
        </Text>
      </Stack>

      <Card
        title={`Edit subscription plan for Product id ${data.productId}`}
        sectioned
      >
        <TextField
          label="Plan title"
          value={planTitle}
          onChange={setPlanTitle}
        />
      </Card>

      <Card title="Delivery and discount" sectioned>
        <Stack>
          <TextField
            type="number"
            label="Delivery frequency (in weeks)"
            value={deliveryFrequency}
            onChange={setDeliveryFrequency}
          />
          <TextField
            type="number"
            label="Percentage off (%)"
            value={percentageOff}
            onChange={setPercentageOff}
          />
        </Stack>
      </Card>

      {cachedActions}
    </>
  );
}

// Your extension must render all four modes
extend(
  'Admin::Product::SubscriptionPlan::Add',
  render(() => <Add />)
);
extend(
  'Admin::Product::SubscriptionPlan::Create',
  render(() => <Create />)
);
extend(
  'Admin::Product::SubscriptionPlan::Remove',
  render(() => <Remove />)
);
extend(
  'Admin::Product::SubscriptionPlan::Edit',
  render(() => <Edit />)
);
