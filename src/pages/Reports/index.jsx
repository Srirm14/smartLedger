import React from 'react';
import Layout from './Layout';
import SalesSummary from './SalesSummary';
import SalesReports from './SalesReports';

const ReportsLayout = () => {
  return (
    <Layout
      summaryComponent={SalesSummary}
      transactionsComponent={SalesReports}
    />
  );
};

export default ReportsLayout; 