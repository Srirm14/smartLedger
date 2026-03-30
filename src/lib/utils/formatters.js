export const formatINR = (amount) => {
    if (amount === undefined || amount === null) return "";
    
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Add other formatting functions below
  export const formatDate = () => {
    // Your date formatting logic
  };
  
  export const formatPhoneNumber = () => {
    // Your phone formatting logic
  };
  