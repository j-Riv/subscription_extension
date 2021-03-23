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
  const [percentageOff, setPercentageOff] = useState('5');
  const [merchantCode, setMerchantCode] = useState('');
  const [planGroupOption, setPlanGroupOption] = useState('');
  const [intervalOption, setIntervalOption] = useState('WEEK');
  const [numberOfPlans, setNumberOfPlans] = useState('1');

  const onPrimaryAction = useCallback(async () => {
    const token = await getSessionToken();

    // Here, send the form data to your app server to create the new plan.
    // The product and variant ID's collected from the modal form.
    interface CreatePayload {
      productId: string;
      variantId?: string;
      planTitle: string;
      percentageOff: string;
      merchantCode: string;
      intervalOption: string;
      numberOfPlans: string;
      planGroupOption: string;
    }

    let payload: CreatePayload = {
      productId: data.productId,
      variantId: data.variantId,
      planTitle: planTitle,
      percentageOff: percentageOff,
      merchantCode: merchantCode,
      intervalOption: intervalOption,
      numberOfPlans: numberOfPlans,
      planGroupOption: planGroupOption,
    };

    console.log('THE PAYLOAD');
    console.log(payload);

    // Send the form data to your app server to create the new plan.
    const response = await fetch(`${serverUrl}/subscription-plan/create`, {
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
    numberOfPlans,
    planGroupOption,
  ]);

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
        <Text size="titleLarge">Create Subscription Plan</Text>
      </Stack>

      <Card
        title={`Create Subscription Plan for Product: ${data.productId}`}
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
          <Select
            label="Max Number Weeks / Months"
            options={[
              { label: '1', value: '1' },
              { label: '2', value: '2' },
              { label: '3', value: '3' },
            ]}
            onChange={setNumberOfPlans}
            value={numberOfPlans}
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

export default Create;
