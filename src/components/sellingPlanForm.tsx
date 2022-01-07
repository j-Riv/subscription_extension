import React, { useState } from 'react';
import {
  CardSection,
  TextField,
  Text,
  Select,
  BlockStack,
  useData,
  useContainer,
  useLocale,
  useSessionToken,
} from '@shopify/admin-ui-extensions-react';
import { Translations, translations } from './config';

function SellingPlanForm({ index, handleSellingPlans }) {
  const [planName, setPlanName] = useState<string>('');
  const [intervalOption, setIntervalOption] = useState<string>('MONTH');
  const [intervalCount, setIntervalCount] = useState<string>('1');
  const [percentageOff, setPercentageOff] = useState<string>('5');

  const handlePlanName = (name: string) => {
    setPlanName(name);
    handleSellingPlans(index, {
      id: index,
      intervalCount,
      intervalOption,
      percentageOff,
      planName: name,
    });
  };

  const handleIntervalCount = (count: string) => {
    setIntervalCount(count);
    handleSellingPlans(index, {
      id: index,
      intervalCount: count,
      intervalOption,
      percentageOff,
      planName,
    });
  };

  const handleIntervalOption = (interval: string) => {
    setIntervalOption(interval);
    handleSellingPlans(index, {
      id: index,
      intervalCount,
      intervalOption: interval,
      percentageOff,
      planName,
    });
  };

  const handlePercentageOff = (percent: string) => {
    setPercentageOff(percent);
    handleSellingPlans(index, {
      id: index,
      intervalCount,
      intervalOption,
      percentageOff: percent,
      planName,
    });
  };

  return (
    <CardSection title={`Selling Plan ${index}`}>
      <TextField
        label="Plan Name"
        value={planName}
        onChange={value => handlePlanName(value)}
      />
      <BlockStack>
        <Select
          label="Interval"
          options={[
            {
              label: 'Daily',
              value: 'DAY',
            },
            {
              label: 'Weekly',
              value: 'WEEK',
            },
            {
              label: 'Monthly',
              value: 'MONTH',
            },
            {
              label: 'Yearly',
              value: 'YEAR',
            },
          ]}
          onChange={value => handleIntervalOption(value)}
          value={intervalOption}
        />
        <Select
          label="Interval Count"
          options={[
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
          ]}
          onChange={value => handleIntervalCount(value)}
          value={intervalCount}
        />
        <TextField
          type="number"
          label="Percentage Off (%)"
          value={percentageOff}
          onChange={value => handlePercentageOff(value)}
        />
      </BlockStack>
    </CardSection>
  );
}

export default SellingPlanForm;
