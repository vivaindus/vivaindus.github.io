export const AuditEngine = {
  generateIntegrityHash: async (data) => {
    const encoder = new TextEncoder();
    // Exclude volatile UI fields before hashing
    const { history, auditLog, ...stableData } = data;
    const dataStr = JSON.stringify(stableData);
    const msgBuffer = encoder.encode(dataStr);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  },

  createRevision: (invoice) => {
    const version = (invoice.version || 1) + 1;
    return {
      ...invoice,
      version,
      status: 'DRAFT',
      locked: false,
      history: [...(invoice.history || []), { ...invoice, history: undefined }]
    };
  }
};