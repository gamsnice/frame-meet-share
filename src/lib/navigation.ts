import type { NavigateFunction } from 'react-router-dom';

export type UpgradeReason = 'events' | 'templates' | 'downloads';

/**
 * Navigate to the upgrade/select plan page with consistent parameters
 */
export const navigateToUpgrade = (
  navigate: NavigateFunction, 
  reason?: UpgradeReason
) => {
  const params = new URLSearchParams();
  params.set('mode', 'upgrade');
  if (reason) {
    params.set('reason', reason);
  }
  navigate(`/admin/select-plan?${params.toString()}`);
};
