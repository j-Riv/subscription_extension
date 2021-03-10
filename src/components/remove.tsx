import React, { useEffect, useMemo } from 'react';
import {
  Text,
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

export default Remove;
