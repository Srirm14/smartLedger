import React from 'react';
import TransactionLedger from '../TransactionLedger';

const TransactionLedgerSection = ({ dateRange }) => {
  return (
    <div className="space-y-4">
      {/* Transaction Ledger with integrated filters */}
      <TransactionLedger dateRange={dateRange} />
    </div>
  );
};

export default TransactionLedgerSection; 