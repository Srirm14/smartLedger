import { ContentHeader } from "@/components/Header/ContentHeader";

const CustomerHeader = ({ customerName, customerId, onBackClick }) => {
  return (
    <ContentHeader
      title={customerName}
      description={`Customer ID: ${customerId}`}
      showBackButton={true}
      onBack={onBackClick}
    />
  );
};

export default CustomerHeader; 
