/**
 * Darkstore localStorage persistence for mock/demo mode.
 * Keeps user actions (receive transfer, approve/reject, resolve QC, stock updates) after page refresh.
 */

const PREFIX = 'darkstore_';

export const darkstorePersistence = {
  receivedTransferIds: (): string[] => {
    try {
      const raw = localStorage.getItem(PREFIX + 'received_transfers');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  setReceivedTransfer: (transferId: string) => {
    try {
      const ids = darkstorePersistence.receivedTransferIds();
      if (!ids.includes(transferId)) ids.push(transferId);
      localStorage.setItem(PREFIX + 'received_transfers', JSON.stringify(ids));
    } catch (_) {}
  },

  outboundTransferStatus: (): Record<string, 'approved' | 'rejected'> => {
    try {
      const raw = localStorage.getItem(PREFIX + 'outbound_transfer_status');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },
  setOutboundTransferStatus: (requestId: string, status: 'approved' | 'rejected') => {
    try {
      const map = darkstorePersistence.outboundTransferStatus();
      map[requestId] = status;
      localStorage.setItem(PREFIX + 'outbound_transfer_status', JSON.stringify(map));
    } catch (_) {}
  },

  resolvedFailureIds: (): string[] => {
    try {
      const raw = localStorage.getItem(PREFIX + 'resolved_failures');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  setResolvedFailure: (failureId: string) => {
    try {
      const ids = darkstorePersistence.resolvedFailureIds();
      if (!ids.includes(failureId)) ids.push(failureId);
      localStorage.setItem(PREFIX + 'resolved_failures', JSON.stringify(ids));
    } catch (_) {}
  },

  stockOverrides: (): Record<string, { stock?: number; status?: string }> => {
    try {
      const raw = localStorage.getItem(PREFIX + 'stock_overrides');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },
  setStockOverride: (sku: string, patch: { stock?: number; status?: string; name?: string; category?: string; location?: string }) => {
    try {
      const map = darkstorePersistence.stockOverrides();
      map[sku] = { ...map[sku], ...patch };
      localStorage.setItem(PREFIX + 'stock_overrides', JSON.stringify(map));
    } catch (_) {}
  },
  deletedSkus: (): string[] => {
    try {
      const raw = localStorage.getItem(PREFIX + 'stock_deleted');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },
  setDeletedSku: (sku: string) => {
    try {
      const ids = darkstorePersistence.deletedSkus();
      if (!ids.includes(sku)) ids.push(sku);
      localStorage.setItem(PREFIX + 'stock_deleted', JSON.stringify(ids));
    } catch (_) {}
  },
};
