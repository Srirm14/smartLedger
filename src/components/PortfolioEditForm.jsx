import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import Button from "./Button/Button";
import TextInput from "./FormComponents/TextInput";
import SelectInput from "./FormComponents/SelectInput";

const AddPortfolioProductForm = ({
  selectedPortfolio,
  portfolioName,
  onClose,
  onSubmit,
}) => {
  const inventoryProducts = useSelector(
    (state) => state.inventory.inventoryProducts
  );
  const inventoryProductsArray = useMemo(
    () => Object.values(inventoryProducts),
    [inventoryProducts]
  );
  const currentDate = useSelector((state) => state.global.selectedDate);

  const getInitialFormData = () => ({
    sales_unit_name: "",
    product_name: "",
    category: "",
    unit_reading: "",
    date: currentDate,
    portfolio_name: portfolioName,
    ...selectedPortfolio,
  });

  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setFormData(getInitialFormData());
  }, [selectedPortfolio, portfolioName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "product_name") {
      const selectedProduct = inventoryProductsArray.find(
        (product) => product.product === value
      );
      setFormData((prevData) => ({
        ...prevData,
        product_name: value,
        category: selectedProduct?.category || "",
        price: selectedProduct?.price || "",
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.sales_unit_name)
      newErrors.sales_unit_name = "Sales unit name is required";
    if (!formData.product_name)
      newErrors.product_name = "Product name is required";
    if (!formData.unit_reading)
      newErrors.unit_reading = "Unit reading is required";
    if (!formData.portfolio_name)
      newErrors.portfolio_name = "Portfolio name is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  // Prepare options for SelectInput
  const productOptions = inventoryProductsArray.map((product) => ({
    value: product.product,
    text: product.product,
  }));

  const categoryOptions = [
    { value: "", text: "Select a category" },
    { value: "Fuel", text: "Fuel" },
    { value: "Consumables", text: "Consumables" },
    { value: "Others", text: "Others" },
  ];

  return (
    <div className="w-[600px] mx-auto p-6 bg-[var(--neutral-white)] rounded-lg">
      <h2 className="text-md font-medium mb-1">
        {selectedPortfolio ? "Edit Portfolio Product" : "Add Portfolio Product"}
      </h2>
      <p className="text-[var(--neutral-gray500)] mb-6 text-xs font-normal">
        {selectedPortfolio
          ? "Update the details of your portfolio product."
          : "Fill in the details to add a new product to the portfolio."}
      </p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <TextInput
          label="Sales Unit Name"
          name="sales_unit_name"
          value={formData.sales_unit_name}
          onChange={handleChange}
          error={Boolean(errors.sales_unit_name)}
          helperText={errors.sales_unit_name}
          fullWidth
          disabled={Boolean(selectedPortfolio)}
          className="bg-[var(--neutral-gray50)]"
        />
        <SelectInput
          label="Product Name"
          name="product_name"
          value={formData.product_name}
          onChange={handleChange}
          error={Boolean(errors.product_name)}
          helperText={errors.product_name}
          options={productOptions}
          disabled={Boolean(selectedPortfolio)}
        />
        <SelectInput
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          error={false}
          helperText={""}
          options={categoryOptions}
          disabled
        />
        <TextInput
          label="Unit Reading"
          name="unit_reading"
          type="number"
          value={formData.unit_reading}
          onChange={handleChange}
          error={Boolean(errors.unit_reading)}
          helperText={errors.unit_reading}
          fullWidth
          className="bg-[var(--neutral-gray50)]"
        />
        <div className="flex justify-end space-x-4 mt-6">
          <Button
            variant="danger"
            nature="outlined"
            onClick={onClose}
            className="text-[var(--danger-500)] border-[var(--danger-500)]"
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            color="primary"
            type="submit"
            className="bg-[var(--primary-500)] text-[var(--neutral-white)]"
          >
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddPortfolioProductForm;