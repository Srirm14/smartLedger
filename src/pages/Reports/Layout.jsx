import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ContentHeader } from "@/components/Header/ContentHeader";

const Layout = ({ 
  summaryComponent: SummaryComponent,
  transactionsComponent: TransactionsComponent 
}) => {
  const [activeTab, setActiveTab] = useState({
    value: 'summary',
    label: 'Sales Summary'
  });

  const tabs = [
    { value: 'summary', label: 'Sales Summary' },
    { value: 'transactions', label: 'Sales Reports' }
  ];

  // Ensure components are valid before rendering
  const renderContent = () => {
    if (activeTab.value === 'summary' && SummaryComponent) {
      return <SummaryComponent />;
    }
    if (activeTab.value === 'transactions' && TransactionsComponent) {
      return <TransactionsComponent />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[var(--neutral-gray50)]">
      <ContentHeader
        title="Reports"
        description="Track and manage your Reports"
        showBackButton={false}
        tabs={tabs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4 max-w-[calc(100vw-2rem)] lg:max-w-[calc(100vw-4rem)] xl:max-w-[calc(100vw-12rem)]">
        {renderContent()}
      </main>
    </div>
  );
};

Layout.propTypes = {
  summaryComponent: PropTypes.elementType.isRequired,
  transactionsComponent: PropTypes.elementType.isRequired
};

export default Layout;        