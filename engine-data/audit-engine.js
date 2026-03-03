export const generateIntegrityHash = async (invoiceData) => {
  const msgUint8 = new TextEncoder().encode(JSON.stringify(invoiceData));
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

export const transitionStatus = async (currentInvoice, nextStatus) => {
  const timestamp = new Date().toISOString();
  const updated = { ...currentInvoice, status: nextStatus, updatedAt: timestamp };
  
  if (nextStatus === 'FINAL') {
    updated.hash = await generateIntegrityHash(updated);
    updated.locked = true;
  }
  
  updated.auditLog = [
    ...(currentInvoice.auditLog || []),
    { action: `STATUS_CHANGE_${nextStatus}`, time: timestamp }
  ];
  
  return updated;
};