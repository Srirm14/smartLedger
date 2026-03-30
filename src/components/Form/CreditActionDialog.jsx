import React, { useState, useEffect, useCallback, useMemo } from "react"; // Added useMemo
// import { CreditFormPropTypes } from "../../../propTypes"; // Assuming this is defined elsewhere
import { useCreditCustomerStore } from "../../../store/useCreditCustomerStore";
// import useGlobalDateStore from "../../../store/useGlobalStore"; // Not used in the provided code
import useInventoryStore from "../../../store/useInventoryStore";
import { usePortfolioStore } from "../../../store/usePortfolioStore";
import { useCustomerStore } from "../../../store/useCustomerStore";
import { useShiftConfigStore } from "../../../store/useSettingStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AutocompleteInput } from "@/components/ui/autocomplete-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area"; // Consider if ScrollArea is needed here or within DialogContent styling
import { 
  CalendarIcon, 
  Loader2, 
  Plus, 
  X,
  Briefcase,
  Clock,
  Hash,
  User,
  Truck,
  Package,
  Calculator,
  Ruler,
  IndianRupee
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "../ui/button"; 
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"; // Assuming ../../ui/popover
import { Calendar } from "../ui/calendar"; // Assuming ../../ui/calendar
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import AddVehicleDialog from "./AddVehicleDialog";




const CreditActionDialog = ({
  isOpen,
  onSave,
  onClose,
  selectedData,
  customerName, // Name coming from the parent context (e.g., customer details page)
  customer_id, // Add customer_id prop
  loading,
  isGlobalCreditEntry = false, // Default to false if not provided
}) => {
  const { 
    addVehicleDetails,
    allVehicleDetails, 
    fetchAllVehicleDetails, 
    getVehiclesForCustomer, 
    shouldRefreshVehicles,
    loading: vehicleLoading
  } = useCreditCustomerStore();
  const { inventoryProducts, fetchInventoryProducts } = useInventoryStore();
  const { portfoliolistforcredit, fetchPortfolioListForCredit } = usePortfolioStore();
  const { shiftConfig, fetchShiftConfig } = useShiftConfigStore();
  const { customers, fetchCustomers } = useCustomerStore();

  // --- Initial State Setup ---
  const getInitialFormData = useCallback(() => {
    const initialDate = selectedData?.date
      ? format(new Date(selectedData.date), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd");
    const initialProducts =
      selectedData?.product_name && Array.isArray(selectedData.product_name) && selectedData.product_name.length > 0
        ? selectedData.product_name.map((name, index) => ({
            tempId: Math.random().toString(36).substring(7),
            product_name: name || "",
            quantity: selectedData?.quantity?.[index] ?? 0, // Use nullish coalescing
            uom: selectedData?.uom?.[index] || "",
            price: selectedData?.price?.[index] ?? 0,
            amount: selectedData?.amount?.[index] ?? 0,
          }))
        : [{ tempId: Math.random().toString(36).substring(7), product_name: "", quantity: "", uom: "", price: "", amount: "" }]; // Start with empty strings for better controlled inputs

    return {
      id: selectedData?.id || "",
      date: initialDate,
      vehicle: selectedData?.vehicle_no || "",
      Customer_name: customerName || selectedData?.customer_name || "",
      portfolio_name: selectedData?.portfolio_name || "",
      shift_name: selectedData?.shift_name || "",
      shift_id: selectedData?.shift_id || "", // Ensure shift_id is populated correctly if editing
      products: initialProducts,
    };
  }, [selectedData, customerName]); // Dependencies for initial state calculation

  const [formData, setFormData] = useState(getInitialFormData);
  const [isShiftSelectDisabled, setIsShiftSelectDisabled] = useState(true);
  const [availableShifts, setAvailableShifts] = useState([]);

   useEffect(() => {
    setFormData(getInitialFormData());
    
    if (getInitialFormData().portfolio_name && getInitialFormData().date) {
      setIsShiftSelectDisabled(false);
      fetchShiftConfig(getInitialFormData().date); // Fetch shifts for initial date/portfolio
    } else {
        setIsShiftSelectDisabled(true);
        setAvailableShifts([]);
    }
  }, [isOpen, selectedData, customerName, getInitialFormData, fetchShiftConfig]); // Rerun if these change while dialog might be open

  // Memoize the conditions for fetching
  const shouldFetchVehicles = useMemo(() => {
    return shouldRefreshVehicles() || Object.keys(allVehicleDetails).length === 0;
  }, [shouldRefreshVehicles, allVehicleDetails]);

  // Split the data fetching into separate effects with proper conditions
  useEffect(() => {
    // Only fetch customers if we're in global credit entry mode and the dialog is open
    if (isOpen && isGlobalCreditEntry) {
      fetchCustomers();
    }
  }, [isOpen, isGlobalCreditEntry, fetchCustomers]);

  useEffect(() => {
    // Only fetch inventory products when dialog opens
    if (isOpen) {
      fetchInventoryProducts();
    }
  }, [isOpen, fetchInventoryProducts]);

  useEffect(() => {
    // Only fetch portfolio list when dialog opens
    if (isOpen) {
      fetchPortfolioListForCredit();
    }
  }, [isOpen, fetchPortfolioListForCredit]);

  useEffect(() => {
    // Only fetch vehicle details if needed and dialog is open
    if (isOpen && shouldFetchVehicles) {
      fetchAllVehicleDetails();
    }
  }, [isOpen, shouldFetchVehicles, fetchAllVehicleDetails]);

  // --- Shift Logic Effects ---
  useEffect(() => {
    // Enable shift selection only if portfolio and date are selected
    if (formData.portfolio_name && formData.date) {
      setIsShiftSelectDisabled(false);
      // Fetch shifts whenever the date changes for the selected portfolio
      fetchShiftConfig(formData.date);
    } else {
      setIsShiftSelectDisabled(true);
      setAvailableShifts([]);
      // Reset shift selection if portfolio or date is cleared
      setFormData((prev) => ({ ...prev, shift_name: "", shift_id: "" }));
    }
  }, [formData.portfolio_name, formData.date, fetchShiftConfig]);

  useEffect(() => {
    // Update available shifts based on fetched config and selected portfolio
    if (shiftConfig && formData.portfolio_name) {
      const selectedPortfolioConfig = shiftConfig.find(
        (config) => config.portfolio_name === formData.portfolio_name
      );
      // Filter out shifts that might be null or empty strings
      const validShifts = selectedPortfolioConfig?.shifts?.filter(shift => shift && shift.shift_name && shift.shift_name.trim() !== "") || [];
      setAvailableShifts(validShifts);

       // If the previously selected shift is no longer valid, reset it
       if (formData.shift_name && !validShifts.some(s => s.shift_name === formData.shift_name)) {
          setFormData(prev => ({ ...prev, shift_name: "", shift_id: "" }));
       }

    } else {
      setAvailableShifts([]);
      
       if (formData.shift_name) {
         setFormData(prev => ({ ...prev, shift_name: "", shift_id: "" }));
       }
    }
  }, [shiftConfig, formData.portfolio_name, formData.shift_name]); // Added formData.shift_name dependency for the reset logic


 
  const handleFieldChange = (name, value) => {
    setFormData((prev) => {
        const newState = { ...prev, [name]: value };
        // Reset dependent fields if needed
        if (name === 'portfolio_name') {
            newState.shift_name = "";
            newState.shift_id = "";
        }
        if (name === 'Customer_name') {
            newState.vehicle = ""; // Reset vehicle when customer changes
        }
        return newState;
    });
  };

   // Handler for Date change
   const handleDateChange = (date) => {
    if (date) {
      setFormData((prev) => ({
        ...prev,
        date: format(date, "yyyy-MM-dd"),
        shift_name: "", // Reset shift on date change
        shift_id: "",
      }));
    }
  };

  // Handler for Shift change
  const handleShiftChange = (value) => {
    const selectedShift = availableShifts.find(
      (shift) => shift.shift_name === value
    );
    setFormData((prev) => ({
      ...prev,
      shift_name: value,
      shift_id: selectedShift?.shift_id || "", // Store shift_id
    }));
  };


  // Handler for changes within the products array
  const handleProductDetailChange = (index, field, value) => {
    const updatedProducts = formData.products.map((product, i) => {
      if (i === index) {
        const updatedProduct = { ...product, [field]: value };

        // Auto-calculate Amount or Quantity
        if (field === "quantity" || field === "price") {
          const quantity = parseFloat(updatedProduct.quantity) || 0;
          const price = parseFloat(updatedProduct.price) || 0;
          updatedProduct.amount = (quantity * price).toFixed(2);
        } else if (field === "amount") {
          const amount = parseFloat(updatedProduct.amount) || 0;
          const price = parseFloat(updatedProduct.price) || 0;
          updatedProduct.quantity = price !== 0 ? (amount / price).toFixed(2) : "0.00"; // Avoid division by zero, keep as string for input consistency
        }
        return updatedProduct;
      }
      return product;
    });

    setFormData((prev) => ({
      ...prev,
      products: updatedProducts,
    }));
  };

  // Handler specifically for selecting a product from Autocomplete
  const handleProductSelect = (index, productName) => {
    const selectedProduct = inventoryProducts.find(
      (item) => item.product === productName
    );

    const updatedProducts = formData.products.map((product, i) => {
      if (i === index) {
        const price = selectedProduct?.price ?? 0;
        const quantity = parseFloat(product.quantity) || 0; // Use current quantity if already entered
        const amount = parseFloat(product.amount) || 0; // Use current amount if already entered

        const updatedProduct = {
            ...product,
            product_name: productName,
            price: price,
            uom: selectedProduct?.uom || "",
        };

        // Recalculate based on which field (quantity or amount) might have been entered *before* product selection
        // Prioritize quantity if both potentially exist from previous state.
         if(quantity > 0) {
             updatedProduct.amount = (quantity * price).toFixed(2);
         } else if (amount > 0) {
             updatedProduct.quantity = price !== 0 ? (amount / price).toFixed(2) : "0.00";
             updatedProduct.amount = amount.toFixed(2); // Keep original amount if quantity was derived
         } else {
             // If neither quantity nor amount was set, reset both based on price
             updatedProduct.quantity = "0"; // Default to 0 as string
             updatedProduct.amount = "0.00";
         }

        return updatedProduct;
      }
      return product;
    });

    setFormData((prev) => ({
      ...prev,
      products: updatedProducts,
    }));
  };

  const addProductField = (event) => {
    // event.preventDefault(); // No longer needed if type="button"
    setFormData((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        // Add new product row with a unique tempId and default empty values
        { tempId: Math.random().toString(36).substring(7), product_name: "", quantity: "", uom: "", price: "", amount: "" },
      ],
    }));
    // TODO: Consider focusing the first input (product name) of the newly added row
  };

   const removeProductField = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((_, index) => index !== indexToRemove),
    }));
  };


  // --- Save/Close Handlers ---
  const handleSave = async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Add validation here if needed before saving

    // Find portfolio_id from portfolio_name
    const selectedPortfolio = portfoliolistforcredit.find(p => p.portfolio_name === formData.portfolio_name);
    const portfolio_id = selectedPortfolio?.id || 0;

    // Get customer_id either from prop or from selected customer name
    const selectedCustomer = isGlobalCreditEntry ? customers.find(c => c.customer_name === formData.Customer_name) : null;
    const finalCustomerId = customer_id || selectedCustomer?.id || 0;

    const formattedFormData = {
      id: selectedData?.id,
      customer_name: formData.Customer_name,
      customer_id: finalCustomerId,
      portfolio_name: formData.portfolio_name,
      portfolio_id: portfolio_id,
      vehicle: formData.vehicle,
      shift_id: formData.shift_id,
      shift_name: formData.shift_name,
      date: formData.date,
      products: formData.products
        .filter(p => p.product_name && (parseFloat(p.quantity) > 0 || parseFloat(p.amount) > 0))
        .map((product) => {
          // Find the product from inventoryProducts to get its ID
          const inventoryProduct = inventoryProducts.find(p => p.product === product.product_name);
          return {
            product_name: product.product_name,
            product_id: inventoryProduct?.id || 0,
            uom: product.uom,
            quantity: parseFloat(product.quantity) || 0,
            price: parseFloat(product.price) || 0,
            amount: parseFloat(product.amount) || 0,
          };
        }),
    };
    
    if (!selectedData?.id && formData.id) {
        formattedFormData.id = formData.id;
    }

  
    
    try {
      // Call onSave with the formatted data
      await onSave(formattedFormData);
      
      // Show success toast message
      toast.success(selectedData?.id ? "Credit entry updated successfully!" : "Credit entry added successfully!");
      
      // Reset form data while preserving some fields
      setFormData(prev => ({
        ...getInitialFormData(),
        Customer_name: prev.Customer_name,
        portfolio_name: prev.portfolio_name,
        shift_name: prev.shift_name,
        shift_id: prev.shift_id,
        vehicle: prev.vehicle
      }));
  
    } catch (error) {
      console.error("Error saving credit:", error);
      toast.error("Failed to save credit entry");
    }
  };

  const handleClose = () => {
    // Resetting form state is now handled by the useEffect hook watching `isOpen`
    onClose(); // Call the parent's close handler
  };

  // --- Prepare Options for Autocomplete/Select ---
  const inventoryOptions = inventoryProducts.map((item) => ({
    value: item.product, // value for selection
    text: item.product, // text for display
  }));
  const portfolioOptions = portfoliolistforcredit.map((item) => ({
    value: item.portfolio_name,
    text: item.portfolio_name,
  }));
  
  // Get vehicle options for the selected customer using the optimized store
  const getVehicleOptions = () => {
    if (!formData.Customer_name) return [];
    
    let targetCustomerId = null;
    
    // If customer_id is provided as a prop, use it directly
    if (customer_id) {
      targetCustomerId = customer_id;
    } 
    // If in global credit entry mode, find the customer_id from the selected customer name
    else if (isGlobalCreditEntry) {
      const selectedCustomer = customers.find(c => c.customer_name === formData.Customer_name);
      targetCustomerId = selectedCustomer?.id;
    }
    
    if (!targetCustomerId) return [];
    
    // Get vehicles for this customer from the optimized store
    const customerVehicles = getVehiclesForCustomer(targetCustomerId.toString());
    
    return customerVehicles.map((item) => ({
      value: item.vehicle_no,
      text: item.vehicle_no,
    }));
  };
  
  const vechicalOptions = getVehicleOptions();
    
  const customerOptions = customers.map((item) => ({
    value: item.customer_name,
    text: item.customer_name,
  }));

  // Replace the showNewVehicleDialog state with a simpler one
  const [showNewVehicleDialog, setShowNewVehicleDialog] = useState(false);

  // Add handler for when a new vehicle is added
  const handleVehicleAdded = (vehicleNumber) => {
    setFormData(prev => ({
      ...prev,
      vehicle: vehicleNumber
    }));
    
    // Refresh all vehicle details to include the newly added vehicle
    fetchAllVehicleDetails();
  };

  return (
    // Use onOpenChange for better dialog closing behavior (clicking outside, Esc key)
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      {/* Add custom scrollbar hiding styles */}
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Increased dialog width from max-w-4xl to max-w-6xl for better spacing */}
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col overflow-hidden p-0">
        {/* Sticky Header */}
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
             {selectedData?.id ? "Edit Credit Entry" : "Add Credit Entry"}
          </DialogTitle>
        </DialogHeader>

        {/* Scrollable Form Area */}
        <div className="flex-grow overflow-y-auto overflow-x-hidden scrollbar-none">
          <form id="credit-form-id" onSubmit={handleSave} className="p-6">
            {/* Credit Details Section */}
            <div className="mb-8">
              <div className="mb-6">
                <h3 className="text-md font-semibold text-[var(--neutral-gray800)] dark:text-[var(--neutral-gray100)] mb-1">
                  Credit Details
                </h3>
                <p className="text-sm text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]">
                  Enter the basic information for this credit entry
                </p>
              </div>

              {/* Basic Information Grid with improved spacing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-lg border border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
                {/* First Row: Date, Portfolio, Shift */}
                <div className="space-y-2">
                    <Label htmlFor="entry-date" className="text-sm font-medium">Date</Label>
                    {/* Popover for Calendar */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="entry-date"
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${
                                    !formData.date ? "text-muted-foreground" : ""
                                }`}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.date ? formData.date : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-0 z-[9999]" 
                          align="end" 
                          side="bottom"
                          avoidCollisions={true}
                          collisionPadding={10}
                        >
                            <Calendar
                                mode="single"
                                selected={formData.date ? new Date(formData.date + 'T00:00:00') : undefined}
                                onSelect={handleDateChange}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                   <Label htmlFor="portfolio-name" className="text-sm font-medium">Portfolio</Label>
                   <div className="relative">
                     <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                     <AutocompleteInput
                       id="portfolio-name"
                       value={formData.portfolio_name}
                       onChange={(value) => handleFieldChange('portfolio_name', value)}
                       options={portfolioOptions}
                       placeholder="Select Portfolio"
                       required
                       disabled={portfoliolistforcredit.length === 0}
                       className="pl-9"
                     />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label htmlFor="shift-name" className="text-sm font-medium">Shift</Label>
                   <div className="relative">
                     <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 z-10" />
                     <Select
                       value={formData.shift_name}
                       onValueChange={handleShiftChange}
                       required
                       disabled={isShiftSelectDisabled || availableShifts.length === 0}
                     >
                       <SelectTrigger id="shift-name" className="pl-9">
                         <SelectValue placeholder="Select shift" />
                       </SelectTrigger>
                       <SelectContent>
                         {isShiftSelectDisabled && (
                           <SelectItem value="placeholder_disabled" disabled>
                             Select Portfolio and Date first
                           </SelectItem>
                         )}
                          {!isShiftSelectDisabled && availableShifts.length === 0 && (
                            <SelectItem value="no_shifts" disabled>
                              No shifts found for selection
                            </SelectItem>
                          )}
                         {availableShifts.map((shift) => (
                           <SelectItem
                             key={shift.shift_id || shift.shift_name}
                             value={shift.shift_name}
                           >
                             {shift.shift_name}
                           </SelectItem>
                         ))}
                       </SelectContent>
                     </Select>
                   </div>
                </div>

                {/* Second Row: Entry ID, Customer Name, Vehicle */}
                {selectedData?.id ? (
                   <div className="space-y-2">
                      <Label htmlFor="credit-id" className="text-sm font-medium">ID</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input id="credit-id" value={formData.id} readOnly disabled className="pl-9 bg-[var(--neutral-gray100)] dark:bg-[var(--neutral-gray800)]"/>
                      </div>
                   </div>
                 ) : (
                   <div className="space-y-2">
                      <Label htmlFor="credit-id" className="text-sm font-medium">Entry ID</Label>
                      <div className="relative">
                        <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                            id="credit-id"
                            value={formData.id}
                            onChange={(e) => handleFieldChange('id', e.target.value)}
                            placeholder="Invoice Number"
                            className="pl-9"
                        />
                      </div>
                   </div>
                 )}

                 <div className="space-y-2">
                   <Label htmlFor="customer-name" className="text-sm font-medium">Customer Name</Label>
                   <div className="relative">
                     <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                     <AutocompleteInput
                       id="customer-name"
                       value={formData.Customer_name}
                       onChange={(value) => handleFieldChange('Customer_name', value)}
                       options={customerOptions}
                       placeholder="Select or type Customer"
                       disabled={!!customerName || !isGlobalCreditEntry}
                       required
                       className="pl-9"
                     />
                   </div>
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="vehicle-no" className="text-sm font-medium">Vehicle</Label>
                   <div className="flex gap-2">
                     <div className="relative flex-1">
                       <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                       <AutocompleteInput
                         id="vehicle-no"
                         value={formData.vehicle}
                         onChange={(value) => handleFieldChange('vehicle', value)}
                         options={vechicalOptions}
                         placeholder={
                           !formData.Customer_name 
                             ? "Select Customer first" 
                             : vehicleLoading 
                               ? "Loading vehicles..." 
                               : vechicalOptions.length === 0 
                                 ? "No vehicles found" 
                                 : "Select Vehicle"
                         }
                         disabled={!formData.Customer_name || vehicleLoading}
                         className="pl-9"
                       />
                     </div>
                     <Popover open={showNewVehicleDialog} onOpenChange={setShowNewVehicleDialog}>
                       <PopoverTrigger asChild>
                         <Button
                           type="button"
                           variant="outline"
                           size="icon"
                           disabled={!formData.Customer_name || vehicleLoading}
                           title="Add New Vehicle"
                         >
                           <Plus className="h-4 w-4" />
                         </Button>
                                                </PopoverTrigger>
                        <PopoverContent 
                          className="w-auto p-0 z-[9999]" 
                          align="end" 
                          side="bottom"
                          avoidCollisions={true}
                          collisionPadding={10}
                        >
                           <AddVehicleDialog
                           isOpen={true}
                           onClose={() => setShowNewVehicleDialog(false)}
                           customerName={formData.Customer_name}
                           customerId={customer_id || (isGlobalCreditEntry ? customers.find(c => c.customer_name === formData.Customer_name)?.id : null)}
                           onVehicleAdded={handleVehicleAdded}
                           addVehicleDetails={addVehicleDetails}
                           fetchVehicleDetails={() => fetchAllVehicleDetails()}
                           isPopover={true}
                         />
                       </PopoverContent>
                     </Popover>
                   </div>
                 </div>
               </div>
            </div>

            {/* Associated Products Section */}
            <div className="mb-6">
              <div className="mb-6">
                <h3 className="text-md font-semibold text-[var(--neutral-gray800)] dark:text-[var(--neutral-gray100)] mb-1">
                  Associated Products
                </h3>
                <p className="text-sm text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]">
                  Add products and their quantities for this credit entry
                </p>
              </div>

              <div className="p-6 rounded-lg border border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
                <div className="flex justify-between items-center mb-6">
                  <Label className="text-base font-medium">Products</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addProductField}
                    className="flex items-center gap-2 text-sm h-9 px-4"
                  >
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </div>

                {/* Product table header */}
                <div className="grid grid-cols-12 gap-3 px-4 py-3 text-sm font-medium text-[var(--neutral-gray600)] dark:text-[var(--neutral-gray300)] bg-[var(--neutral-gray100)] dark:bg-[var(--neutral-gray800)] rounded-lg border-b border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
                  <div className="col-span-4 text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">Product Name</div>
                  <div className="col-span-2 text-center text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">Quantity</div>
                  <div className="col-span-2 text-center text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">UOM</div>
                  <div className="col-span-2 text-center text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray300)]">Amount</div>
                  <div className="col-span-2 text-center">Actions</div>
                </div>

                <div className="space-y-3 mt-3">
                  {formData.products.map((product, index) => (
                    <div key={product.tempId} className="grid grid-cols-12 gap-3 px-4 py-4 items-center bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] border border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] rounded-md shadow-sm">
                      {/* Product Name */}
                      <div className="col-span-4">
                        <div className="relative">
                          <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <AutocompleteInput
                            id={`product-name-${index}`}
                            value={product.product_name}
                            onChange={(value) => handleProductSelect(index, value)}
                            options={inventoryOptions}
                            placeholder="Select Product"
                            required
                            className="pl-9"
                          />
                        </div>
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2">
                        <div className="relative">
                          <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            value={product.quantity}
                            placeholder="0.00"
                            min={0}
                            step="any"
                            onChange={(e) => handleProductDetailChange(index, 'quantity', e.target.value)}
                            required
                            className="pl-9 text-center"
                          />
                        </div>
                      </div>

                      {/* UOM */}
                      <div className="col-span-2">
                        <div className="relative">
                          <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            value={product.uom}
                            placeholder="Unit"
                            readOnly
                            disabled
                            className="pl-9 text-center bg-[var(--neutral-gray100)] dark:bg-[var(--neutral-gray800)]"
                          />
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2">
                        <div className="relative">
                          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                          <Input
                            type="number"
                            value={product.amount}
                            placeholder="0.00"
                            min={0}
                            step="any"
                            onChange={(e) => handleProductDetailChange(index, 'amount', e.target.value)}
                            required
                            className="pl-9 text-center"
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      <div className="col-span-2 flex justify-center items-center">
                        {formData.products.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-[var(--danger-50)] hover:text-[var(--danger-500)] dark:hover:bg-[var(--danger-900)] dark:hover:text-[var(--danger-400)]"
                            onClick={() => removeProductField(index)}
                            aria-label="Remove product"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>

         {/* Sticky Footer */}
        <div className="px-6 py-3 border-t border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)] bg-none dark:bg-[var(--neutral-gray900)] flex justify-end items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={loading}
            className="text-[var(--neutral-gray700)] hover:text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray300)] dark:hover:text-[var(--neutral-gray100)]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="credit-form-id"
            className="bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-[var(--neutral-white)] dark:bg-[var(--primary-600)] dark:hover:bg-[var(--primary-500)]"
            disabled={loading || formData.products.length === 0 || !formData.products.some(p => p.product_name)}
            onClick={handleSave}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {selectedData?.id ? "Updating..." : "Adding..."}
              </>
            ) : (
              selectedData?.id ? "Update Credit" : "Add Credit"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreditActionDialog;