'use client';

import React from 'react';
import { TaxonomySidebar } from './TaxonomySidebar';
import type { NavTab } from './NavigationMenu';

export const SlimSidebar: React.FC<{
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}> = (props) => {
  return <TaxonomySidebar {...props} />;
};
