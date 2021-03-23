import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  TextField,
  Text,
  Select,
  Stack,
  useData,
  useContainer,
  useLocale,
  useSessionToken,
} from '@shopify/argo-admin-react';
import Actions from './actions';
import { Translations, translations, serverUrl } from './config';

// 'Edit' mode should modify an existing selling plan.
// Changes should affect other products that have this plan applied.
// [Shopify admin renders this mode inside an app overlay container]
function Edit() {
  const data = useData<'Admin::Product::SubscriptionPlan::Edit'>();
  const [sellingPlans, setSellingPlans] = useState('');
  const [planTitle, setPlanTitle] = useState('');
  const [merchantCode, setMerchantCode] = useState('');
  const [planGroupOption, setPlanGroupOption] = useState('');
  const [intervalOption, setIntervalOption] = useState('Week');
  const [percentageOff, setPercentageOff] = useState('0');
  const locale = useLocale();
  const localizedStrings: Translations = useMemo(() => {
    return translations[locale] || translations.en;
  }, [locale]);

  const { getSessionToken } = useSessionToken();

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
    setPlanTitle(selectedPlan.name);
    setMerchantCode(selectedPlan.merchantCode);
    setPlanGroupOption(selectedPlan.options[0]);
    setPercentageOff(selectedPlan.percentageOff.toString());
    setSellingPlans(selectedPlan.sellingPlans);
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
      percentageOff: string;
      merchantCode: string;
      intervalOption: string;
      planGroupOption: string;
      sellingPlans: any;
    }

    let payload: EditPayload = {
      sellingPlanGroupId: data.sellingPlanGroupId,
      productId: data.productId,
      variantId: data.variantId,
      planTitle: planTitle,
      percentageOff: percentageOff,
      merchantCode: merchantCode,
      intervalOption: intervalOption,
      planGroupOption: planGroupOption,
      sellingPlans: sellingPlans,
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
  }, [
    getSessionToken,
    done,
    planTitle,
    percentageOff,
    merchantCode,
    intervalOption,
    planGroupOption,
    sellingPlans,
  ]);

  const cachedActions = useMemo(
    () => (
      <Actions onPrimary={onPrimaryAction} onClose={close} title="Edit Plan" />
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
          label="Plan Title"
          value={planTitle}
          onChange={setPlanTitle}
        />
        <TextField
          label="Merchant Code"
          value={merchantCode}
          onChange={setMerchantCode}
        />
        <TextField
          label="Options"
          value={planGroupOption}
          onChange={setPlanGroupOption}
        />
      </Card>

      <Card title="Delivery and Discount" sectioned>
        <Stack>
          <Select
            label="Interval"
            options={[
              {
                label: 'Weekly',
                value: 'WEEK',
              },
              {
                label: 'Monthly',
                value: 'MONTH',
              },
            ]}
            onChange={setIntervalOption}
            value={intervalOption}
          />
          <TextField
            type="number"
            label="Percentage Off (%)"
            value={percentageOff}
            onChange={setPercentageOff}
          />
        </Stack>
      </Card>

      {cachedActions}
    </>
  );
}

export default Edit;
