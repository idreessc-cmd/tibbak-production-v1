import { AdminAuditEvent } from '@/types';

// In-memory append-only audit event log
const inMemoryAuditLogs: AdminAuditEvent[] = [
  {
    id: 'audit-001',
    actorRole: 'admin',
    actorId: 'admin-1',
    action: 'provider_verification_approved',
    entityType: 'verification',
    entityId: 'verif-doc-1',
    beforeSummary: 'Status: under_review (Dr. Firas Khatib)',
    afterSummary: 'Status: verified',
    reason: 'Verified official Jordanian Medical Council license and Board certificate.',
    createdAt: '2026-07-20T10:00:00Z',
    isDemo: true
  },
  {
    id: 'audit-002',
    actorRole: 'admin',
    actorId: 'admin-1',
    action: 'subscription_plan_upgraded',
    entityType: 'subscription',
    entityId: 'doc-3',
    beforeSummary: 'Plan: free (Dr. Layla Al-Husseini)',
    afterSummary: 'Plan: vip',
    reason: 'Simulated upgrade to VIP plan during pilot evaluation.',
    createdAt: '2026-07-21T14:30:00Z',
    isDemo: true
  },
  {
    id: 'audit-003',
    actorRole: 'admin',
    actorId: 'admin-1',
    action: 'campaign_activated',
    entityType: 'campaign',
    entityId: 'camp-001',
    beforeSummary: 'Status: draft (Dr. Omar Al-Natsheh)',
    afterSummary: 'Status: active (Placement: search_top)',
    reason: 'Activated pilot sponsored placement campaign.',
    createdAt: '2026-07-22T09:15:00Z',
    isDemo: true
  }
];

export function recordAdminAuditEvent(params: {
  action: string;
  entityType: AdminAuditEvent['entityType'];
  entityId: string;
  beforeSummary: string;
  afterSummary: string;
  reason?: string;
  actorId?: string;
}): AdminAuditEvent {
  const event: AdminAuditEvent = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    actorRole: 'admin',
    actorId: params.actorId || 'admin-system',
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    beforeSummary: params.beforeSummary,
    afterSummary: params.afterSummary,
    reason: params.reason || 'Admin action recorded',
    createdAt: new Date().toISOString(),
    isDemo: true
  };

  inMemoryAuditLogs.unshift(event); // Prepend so latest appears first
  return event;
}

export function getAdminAuditEvents(filters?: {
  action?: string;
  entityType?: string;
  searchQuery?: string;
  entityId?: string;
}): AdminAuditEvent[] {
  let list = [...inMemoryAuditLogs];

  if (!filters) return list;

  if (filters.action && filters.action !== 'all') {
    list = list.filter(e => e.action === filters.action);
  }

  if (filters.entityType && filters.entityType !== 'all') {
    list = list.filter(e => e.entityType === filters.entityType);
  }

  if (filters.entityId) {
    list = list.filter(e => e.entityId === filters.entityId);
  }

  if (filters.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.toLowerCase().trim();
    list = list.filter(e => 
      e.id.toLowerCase().includes(q) ||
      e.action.toLowerCase().includes(q) ||
      e.entityId.toLowerCase().includes(q) ||
      e.beforeSummary.toLowerCase().includes(q) ||
      e.afterSummary.toLowerCase().includes(q) ||
      (e.reason && e.reason.toLowerCase().includes(q))
    );
  }

  return list;
}

export const appendAdminAuditEvent = recordAdminAuditEvent;
export const filterAdminAuditEvents = getAdminAuditEvents;

export function resetAdminAuditFixtures(): void {
  inMemoryAuditLogs.length = 0;
  inMemoryAuditLogs.push(
    {
      id: 'audit-001',
      actorRole: 'admin',
      actorId: 'admin-1',
      action: 'provider_verification_approved',
      entityType: 'verification',
      entityId: 'verif-doc-1',
      beforeSummary: 'Status: under_review (Dr. Firas Khatib)',
      afterSummary: 'Status: verified',
      reason: 'Verified official Jordanian Medical Council license and Board certificate.',
      createdAt: '2026-07-20T10:00:00Z',
      isDemo: true
    },
    {
      id: 'audit-002',
      actorRole: 'admin',
      actorId: 'admin-1',
      action: 'subscription_plan_upgraded',
      entityType: 'subscription',
      entityId: 'doc-3',
      beforeSummary: 'Plan: free (Dr. Layla Al-Husseini)',
      afterSummary: 'Plan: vip',
      reason: 'Simulated upgrade to VIP plan during pilot evaluation.',
      createdAt: '2026-07-21T14:30:00Z',
      isDemo: true
    },
    {
      id: 'audit-003',
      actorRole: 'admin',
      actorId: 'admin-1',
      action: 'campaign_activated',
      entityType: 'campaign',
      entityId: 'camp-001',
      beforeSummary: 'Status: draft (Dr. Omar Al-Natsheh)',
      afterSummary: 'Status: active (Placement: search_top)',
      reason: 'Activated pilot sponsored placement campaign.',
      createdAt: '2026-07-22T09:15:00Z',
      isDemo: true
    }
  );
}

