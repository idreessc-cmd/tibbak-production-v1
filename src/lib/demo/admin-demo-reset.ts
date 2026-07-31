import { recordAdminAuditEvent } from '@/lib/audit/admin-audit-log';
import { resetVerificationQueue } from '@/lib/admin/provider-verification';
import { resetSponsoredCampaigns } from '@/lib/campaigns/sponsored-campaigns';
import { activeMockDoctors } from '@/lib/repositories/doctors';
import { activeMockHospitals } from '@/lib/repositories/hospitals';

export function executeDemoEnvironmentReset(isDemoMode: boolean): boolean {
  if (!isDemoMode) {
    console.warn('[DemoReset] Attempted reset without demo=1 context. Aborted.');
    return false;
  }

  resetVerificationQueue();
  resetSponsoredCampaigns();

  // Reset operational status on doctors & hospitals
  activeMockDoctors.forEach(d => {
    d.operationalStatus = (d.id === 'doc-governance-suspended' ? 'suspended' : 'active');
    d.subscriptionPlan = (d.id === 'doc-3' ? 'free' : d.subscriptionPlan);
  });

  activeMockHospitals.forEach(h => {
    h.operationalStatus = (h.id === 'hosp-governance-suspended' ? 'suspended' : 'active');
  });

  recordAdminAuditEvent({
    action: 'demo_data_reset',
    entityType: 'system',
    entityId: 'admin-reset',
    beforeSummary: 'State: Modified QA state',
    afterSummary: 'State: Reset to baseline demo fixtures',
    reason: 'Admin executed explicit QA demo environment reset.'
  });

  return true;
}
