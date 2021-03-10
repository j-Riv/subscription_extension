import React from 'react';
import { Button, Stack } from '@shopify/argo-admin-react';

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

export default Actions;
