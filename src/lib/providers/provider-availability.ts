import { ProviderOperationalStatus } from '@/types';

export interface OperationalEntity {
  operationalStatus: ProviderOperationalStatus;
}

export function isProviderPubliclyVisible(provider: OperationalEntity): boolean {
  return provider.operationalStatus === 'active';
}

export function isProviderBookable(provider: OperationalEntity): boolean {
  return provider.operationalStatus === 'active';
}

export function canProviderReceiveNewCases(provider: OperationalEntity): boolean {
  return provider.operationalStatus === 'active';
}

export function canProviderRunSponsoredCampaign(provider: OperationalEntity): boolean {
  return provider.operationalStatus === 'active';
}

export function canProviderBeReactivated(provider: OperationalEntity): boolean {
  return provider.operationalStatus === 'suspended' || provider.operationalStatus === 'inactive';
}

export function getProviderOperationalErrorCode(provider: OperationalEntity): string | null {
  switch (provider.operationalStatus) {
    case 'active':
      return null;
    case 'suspended':
      return 'PROVIDER_SUSPENDED';
    case 'inactive':
      return 'PROVIDER_INACTIVE';
    case 'archived':
      return 'PROVIDER_ARCHIVED';
    default:
      return 'PROVIDER_SUSPENDED';
  }
}
