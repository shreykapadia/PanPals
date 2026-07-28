import React from 'react';
import { Redirect } from 'expo-router';

/**
 * Route backing the centre ⊕ Log tab button.
 * Directly navigating to /(tabs)/log redirects to the F1 fast-log sheet in Inventory.
 */
export default function LogTabRoute() {
  return <Redirect href={{ pathname: '/(tabs)/inventory', params: { action: 'log' } }} />;
}
