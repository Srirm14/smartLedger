import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateFilter } from '@/components/DateFilter';
import { Info, TrendingUp, TrendingDown, CirclePlus, Calendar, Type, DollarSign, Tag, FileText, CreditCard } from 'lucide-react';
import { formatINR } from '@/lib/utils/formatters';
import { getResponsiveWidth } from '@/lib/utils/responsiveWidth';
import { ContentHeader } from '@/components/Header/ContentHeader';
import { useTransactionLedgerStore } from '../../../store/useTransactionLedgerStore';
import { getBankAccountDetails } from '@/services/apiService';
import TransactionLedgerSection from './Components/TransactionLedgerSection';
import GlobalEntriesSection from './Components/GlobalEntriesSection';
import { subMonths } from 'date-fns';
import { toast } from 'react-hot-toast';
import useGlobalEntriesStore from '../../../store/useGlobalEntriesStore';

const CashflowV3 = () => {
  const [activeTab, setActiveTab] = useState('transaction-ledger');
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 1),
    to: new Date()
  });
  const responsiveWidth = getResponsiveWidth();
  
  // Get transaction data from the store
  const { transactions } = useTransactionLedgerStore();
  
  // Get global entries data from the store
  const { 
    globalEntries = [], // Provide default empty array
    isLoading: isLoadingGlobalEntries,
    fetchGlobalEntries,
    updateGlobalEntry,
    deleteGlobalEntry,
    addGlobalEntry 
  } = useGlobalEntriesStore();

  // State for bank accounts from API
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);

  // Fetch global entries when tab changes to global-entries
  useEffect(() => {
    if (activeTab === 'global-entries') {
      fetchGlobalEntries();
    }
  }, [activeTab, fetchGlobalEntries]);

  // Fetch bank accounts from API
  useEffect(() => {
    const fetchBankAccounts = async () => {
      setLoadingBankAccounts(true);
      try {
        const response = await getBankAccountDetails();
        
        // Always include a Cash account for empty values
        const cashAccount = {
          id: 'cash', 
          bank_name: 'Cash'
        };
        
        if (response) {
          // Convert the object with numeric keys to an array
          const bankAccountsArray = Object.values(response).map(account => ({
            id: account.id,
            bank_name: account.bank_name
          }));
          
          // Add Cash account to the list
          setBankAccounts([...bankAccountsArray, cashAccount]);
        } else {
          // Fallback to just Cash account if API fails
          setBankAccounts([cashAccount]);
        }
      } catch (error) {
        console.error("Error fetching bank accounts:", error);
        // Fallback to just Cash account if API fails
        setBankAccounts([{ id: 'cash', bank_name: 'Cash' }]);
      } finally {
        setLoadingBankAccounts(false);
      }
    };

    fetchBankAccounts();
  }, []);

  // Mock data for modes
  const modes = [
    { id: 'cash', name: 'Cash' },
    { id: 'upi', name: 'UPI' },
    { id: 'card', name: 'Card' },
    { id: 'netbanking', name: 'Net Banking' }
  ];

  const handleDateRangeChange = (range) => {
    setDateRange(range);
  };

  // Calculate account-wise summaries from real transaction data
  const getAccountSummaries = () => {
    // Start with an empty object
    const accountSummaries = {};
    
    // Check if we have transaction data
    const hasTransactions = transactions && transactions.length > 0;
    
    if (hasTransactions) {
      // Populate with real transaction data
      transactions.forEach(transaction => {
        const accountName = transaction.bank_account || 'Cash';
        
        if (!accountSummaries[accountName]) {
          accountSummaries[accountName] = {
            totalIncome: 0,
            totalExpense: 0,
            transactions: []
          };
        }
        
        accountSummaries[accountName].transactions.push(transaction);
        if (transaction.type === 'net income') {
          accountSummaries[accountName].totalIncome += transaction.amount;
        } else if (transaction.type === 'expense') {
          accountSummaries[accountName].totalExpense += transaction.amount;
        }
      });
      
      return accountSummaries;
    } else {
      // No transactions, use bank accounts from API with zero values
      if (bankAccounts.length > 0) {
        bankAccounts.forEach(account => {
          accountSummaries[account.bank_name] = {
            totalIncome: 0,
            totalExpense: 0,
            transactions: []
          };
        });
      } else {
        // Fallback to default account names if API fails
        accountSummaries['Cash'] = {
          totalIncome: 0,
          totalExpense: 0,
          transactions: []
        };
      }
      
      return accountSummaries;
    }
  };

  const accountSummaries = getAccountSummaries();
  const hasTransactionData = transactions && transactions.length > 0;

  // Table columns for global entries
  const globalEntryColumns = [
    {
      id: 'date',
      header: () => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-[var(--neutral-gray500)]" />
          <span>Date</span>
        </div>
      ),
    },
    {
      id: 'type',
      header: () => (
        <div className="flex items-center gap-2">
          <Type className="h-4 w-4 text-[var(--neutral-gray500)]" />
          <span>Type</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className={`capitalize ${row.original.type === 'income' ? 'text-[var(--success-500)]' : 'text-[var(--danger-500)]'}`}>
          {row.original.type}
        </span>
      ),
    },
    {
      id: 'amount',
      header: () => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-[var(--neutral-gray500)]" />
          <span>Amount</span>
        </div>
      ),
      cell: ({ row }) => (
        <span className={`${row.original.type === 'income' ? 'text-[var(--success-500)]' : 'text-[var(--danger-500)]'}`}>
          ₹{row.original.amount}
        </span>
      ),
    },
    {
      id: 'mode',
      header: () => (
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-[var(--neutral-gray500)]" />
          <span>Mode</span>
        </div>
      ),
    },
    {
      id: 'category',
      header: () => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-[var(--neutral-gray500)]" />
          <span>Category</span>
        </div>
      ),
    },
    {
      id: 'description',
      header: () => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-[var(--neutral-gray500)]" />
          <span>Description</span>
        </div>
      ),
    },
  ];

  const handleAddEntry = () => {
    const newEntry = {
      id: `temp-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`,
      date: new Date().toISOString().split('T')[0],
      type: 'expense', // Default type
      amount: 0,
      mode: 'cash', // Default mode
      category: '',
      description: '',
    };
    addGlobalEntry(newEntry);
  };

  const handleUpdateRow = async (rowIndex, columnId, value) => {
    const entries = Array.isArray(globalEntries) ? globalEntries : [];
    const updatedEntry = {
      ...entries[rowIndex],
      [columnId]: value,
    };
    await updateGlobalEntry(updatedEntry);
  };

  const handleDeleteRow = async (rowIndex) => {
    const entries = Array.isArray(globalEntries) ? globalEntries : [];
    const entryToDelete = entries[rowIndex];
    if (entryToDelete?.id) {
      await deleteGlobalEntry(entryToDelete.id);
    }
  };

  return (
    <>
      <ContentHeader
        title="Cashflow Management"
        description="Manage your daily cashflow transactions"
        showBackButton={false}
        tabs={[
          { value: 'transaction-ledger', label: 'Transaction Ledger' },
          { value: 'global-entries', label: 'Global Entries' }
        ]}
        activeTab={{ value: activeTab, label: activeTab === 'transaction-ledger' ? 'Transaction Ledger' : 'Global Entries' }}
        setActiveTab={(tab) => setActiveTab(tab.value)}
      />
      
      <div className={`container mx-auto px-4 py-4 my-auto ${responsiveWidth.base} ${responsiveWidth.lg} ${responsiveWidth.xl}`}>
        <Card className="shadow-sm border border-[var(--neutral-gray200)]">
          <CardContent className="p-6">
            {/* Header with Date Filter */}
            <div>
              {activeTab === 'transaction-ledger' && (
                <>
                  <div className='mb-6'>
                    <h2 className="text-lg font-medium text-[var(--neutral-gray800)]">
                      Transaction Ledger
                    </h2>
                    <span className="text-sm text-[var(--neutral-gray500)]">All cashflow transactions</span>
                  </div>
                </>
              )}
              {activeTab === 'global-entries' && (
              <>
              </>
              )}
            </div>

            {/* Content Section */}
            <div className="mt-4">
              {activeTab === 'transaction-ledger' ? (
                <TransactionLedgerSection
                  dateRange={dateRange}
                />
              ) : (
                <GlobalEntriesSection
                  globalEntries={Array.isArray(globalEntries) ? globalEntries : []}
                  isLoading={isLoadingGlobalEntries}
                  showActions={true}
                  modes={modes}
                  globalEntryColumns={globalEntryColumns}
                  onRowUpdate={handleUpdateRow}
                  onRowDelete={handleDeleteRow}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CashflowV3; 