import React from 'react';
import { extend, render } from '@shopify/argo-admin-react';
import Add from './components/add';
import Create from './components/create';
import Edit from './components/edit';
import Remove from './components/remove';

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
