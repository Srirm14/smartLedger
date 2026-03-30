import { useEffect, useState } from "react";
import TextInput from "../FormComponents/TextInput"; // Updated import
import Button from "../Button/Button";
import { CreditFormPropTypes } from "../../../propTypes";
import { LoaderCircle, CirclePlus } from "lucide-react";
import SelectInput from "../FormComponents/SelectInput";
import {useCreditCustomerStore} from "../../../store/useCreditCustomerStore";
import useGlobalDateStore from "../../../store/useGlobalStore";
import  useInventoryStore  from "../../../store/useInventoryStore";
import { usePortfolioStore } from "../../../store/usePortfolioStore";
import  { useCustomerStore } from "../../../store/useCustomerStore";

const RecentFormCredit = ({
  onSave,
  onClose,
  selectedData,
  customerName,
  loading
}) => {
  const {selectedDate} = useGlobalDateStore();
  const {inventoryProducts , fetchInventoryProducts} = useInventoryStore();
  const {portfolioList , fetchPortfolioList} = usePortfolioStore();
  const {customers , fetchCustomers} = useCustomerStore();
  
  // Use the optimized vehicle functions from credit customer store
  const { 
    allVehicleDetails, 
    fetchAllVehicleDetails, 
    getVehiclesForCustomer, 
    shouldRefreshVehicles 
  } = useCreditCustomerStore();

  const [formData, setFormData] = useState({
    id: "",
    date: selectedDate,
    vehicle: "",
    Customer_name: customerName || "",
    portfolio_name: "",
    products: [{ product_name: "", quantity: 0, uom: "", price: 0, amount: 0 }],
  });

  useEffect(() => {
    fetchCustomers();
    fetchInventoryProducts();
    fetchPortfolioList(selectedDate);
    
    // Fetch all vehicle details once (if needed)
    if (shouldRefreshVehicles() || Object.keys(allVehicleDetails).length === 0) {
      fetchAllVehicleDetails();
    }
  }, [fetchCustomers, fetchInventoryProducts, fetchPortfolioList, selectedDate, fetchAllVehicleDetails, shouldRefreshVehicles, allVehicleDetails]);

  useEffect(() => {
    if (selectedData) {
      setFormData({
        id: selectedData.id,
        date: selectedData.date,
        vehicle: selectedData.vehicle_no,
        Customer_name: selectedData.customer_name,
        portfolio_name: selectedData.portfolio_name,
        products: selectedData.product_name.map((name, index) => ({
          product_name: name,
          quantity: selectedData.quantity[index],
          uom: selectedData.uom[index],
          price: selectedData.price[index],
          amount: selectedData.amount[index],
        })),
      });
    }
  }, [selectedData]);
  const handleChange = (event, index) => {
    const { name, value } = event.target;
    const updatedProducts = formData.products.map((item, i) =>
      i === index ? { ...item, [name]: value } : item
    );
    if (name === "quantity") {
      updatedProducts[index].amount = updatedProducts[index].price * value;
    }
    if (name === "amount") {
      updatedProducts[index].quantity = (
        updatedProducts[index].amount / updatedProducts[index].price
      ).toFixed(2);
    }
    setFormData((prevFormData) => ({
      ...prevFormData,
      products: updatedProducts,
    }));
  };
  const handleProductChange = (event, index) => {
    const { value } = event.target;
    const selectedProduct = inventoryProducts.find(
      (item) => item.product === value
    );
    const updatedProducts = formData.products.map((item, i) =>
      i === index
        ? {
            ...item,
            product_name: value,
            price: selectedProduct.price,
            uom: selectedProduct.uom,
            quantity: item.amount
              ? item.amount / selectedProduct.price
              : item.quantity,
            amount: item.quantity
              ? item.quantity * selectedProduct.price
              : item.amount,
          }
        : item
    );
    return setFormData((prevFormData) => ({
      ...prevFormData,
      products: updatedProducts,
    }));
  };

  const addProductField = (event) => {
    event.preventDefault();
    setFormData((prevFormData) => ({
      ...prevFormData,
      products: [
        ...prevFormData.products,
        { product_name: "", quantity: 0, uom: "", price: 0, amount: 0 },
      ],
    }));
  };
  const handleSave = (event) => {
    event.preventDefault();
    const formattedFormData = {
      id: formData.id,
      customer_name: customerName || formData.Customer_name,
      portfolio_name: formData.portfolio_name,
      vehicle: formData.vehicle,
      products: formData.products.map((product) => ({
        product_name: product.product_name,
        uom: product.uom,
        quantity: parseFloat(product.quantity),
        price: parseFloat(product.price),
        amount: parseFloat(product.amount),
      })),
      date: formData.date,
    };

    onSave(formattedFormData);
    setFormData({
      id: "",
      date: "",
      vehicle: "",
      Customer_name: "",
      products: [
        { product_name: " ", quantity: 0, uom: "", price: 0, amount: 0 },
      ],
    });
  };

  const handleClose = () => {
    // Clear the form data before closing
    setFormData({
      id: "",
      date: "",
      vehicle: "",
      Customer_name: "",
      products: [
        { product_name: "", quantity: 0, uom: "", price: 0, amount: 0 },
      ],
    });
    // Call the onClose prop to handle the close action
    onClose();
  };

  const inventoryOptions = inventoryProducts.map((item) => ({
    value: item.product,
    text: item.product,
  }));
  const portfolioOptions = portfolioList.map((item) => ({
    value: item.portfolio_name,
    text: item.portfolio_name,
  }));

  // Get vehicle options for the selected customer using the optimized store
  const getVehicleOptions = () => {
    if (!formData.Customer_name) return [];
    
    // Find the customer ID from the customer name
    const selectedCustomer = customers.find(c => c.customer_name === formData.Customer_name);
    if (!selectedCustomer) return [];
    
    // Get vehicles for this customer from the optimized store
    const customerVehicles = getVehiclesForCustomer(selectedCustomer.id.toString());
    
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

  return (
    <div className="min-h-screen min-w-max relative">
      <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-[var(--neutral-gray900)]/75 dark:bg-[var(--neutral-gray900)]/90">
        <div className="bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] p-6 rounded-lg shadow-lg mt-24 w-max max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-end mb-4">
            <button onClick={onClose}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-[var(--neutral-gray500)] hover:text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray400)] dark:hover:text-[var(--neutral-gray200)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="overflow-y-auto max-h-[80vh]">
            <h2 className="text-xl font-semibold text-center mb-6 text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray50)]">Credit Form</h2>
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex flex-col space-y-4">
              <SelectInput
                  name="portfolio_name"
                  label="Portfolio"
                  value={formData.portfolio_name}
                  onChange={(e) =>
                    setFormData({ ...formData, portfolio_name: e.target.value })
                  }
                  options={portfolioOptions}
                  variant="outlined"
                  className="w-full"
                  required
                />
                <SelectInput
                  name="Customer_name"
                  label="Customer Name"
                  value={formData.Customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, Customer_name: e.target.value })
                  }
                  options={customerOptions}
                  variant="outlined"
                  className="w-full"
                  required
                  disabled={formData.Customer_name !== ""}
                />
                <TextInput
                  name="id"
                  label="ID"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  variant="outlined"
                  className="w-full"
                  required
                />
                <TextInput
                  name="date"
                  label="Date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  variant="outlined"
                  className="w-full"
                  InputLabelProps={{ shrink: true }}
                  required
                  disabled
                />
                <SelectInput
                  name="vehicle"
                  label="Vehicle"
                  value={formData.vehicle}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicle: e.target.value })
                  }
                  options={vechicalOptions}
                  variant="outlined"
                  className="w-full"
                  required
                />
               
              </div>
              {formData.products.map((product, index) => (
                <div
                  key={index}
                  className="form-group flex flex-wrap gap-4 border-b pb-4 mb-4"
                >
                  <SelectInput
                    name="product_name"
                    label="Product"
                    value={product.product_name}
                    onChange={(e) => handleProductChange(e, index)}
                    options={inventoryOptions}
                    variant="outlined"
                    className="w-full sm:flex-1"
                    required
                  />
                  <TextInput
                    name="quantity"
                    label="Quantity"
                    value={product.quantity}
                    onChange={(e) => handleChange(e, index)}
                    variant="outlined"
                    className="w-full sm:flex-1 min-w-[150px]"
                    required
                  />
                  <TextInput
                    name="uom"
                    label="UOM"
                    value={product.uom}
                    onChange={(e) => handleChange(e, index)}
                    variant="outlined"
                    className="w-full sm:flex-1 min-w-[150px]"
                    required
                    disabled
                  />
                  <TextInput
                    name="price"
                    label="Price"
                    value={product.price}
                    onChange={(e) => handleChange(e, index)}
                    variant="outlined"
                    className="w-full sm:flex-1 min-w-[150px]"
                    required
                    disabled
                  />
                  <TextInput
                    name="amount"
                    label="Amount"
                    value={product.amount}
                    onChange={(e) => handleChange(e, index)}
                    variant="outlined"
                    className="w-full sm:flex-1 min-w-[150px]"
                    required
                  />
                </div>
              ))}
              <div className="flex justify-end">
                <Button
                  aria-label="add"
                  onClick={addProductField}
                  nature="outlined"
                  size="xs"
                >
                  <span className="flex items-center gap-2">
                    <span>ADD PRODUCT</span> <CirclePlus size={18} strokeWidth={1.45} />
                  </span>
                </Button>
              </div>
              <div className="flex justify-end gap-4 mt-6">
              { loading ? (
              <LoaderCircle className="w-7 h-7 animate-spin text-[#6C60FB] justify-end" />
            ) : <>
                <Button
                  onClick={handleClose}
                  nature="outlined"
                  className="w-full sm:w-auto py-2"
                >
                  Cancel
                </Button>
                <Button type="submit" className="w-full sm:w-auto py-2" onClick={handleSave}>
                  Submit
                </Button>
              </>
            }
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
};

RecentFormCredit.propTypes = {
  ...CreditFormPropTypes,
};

export default RecentFormCredit;
