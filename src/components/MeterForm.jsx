import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TextInput from "./FormComponents/TextInput";
import Button from "./Button/Button";

const MeterForm = ({ portfolioList, onSave }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const initialFormData = {};
    portfolioList.forEach((portfolio) => {
      initialFormData[`meterQuantity_${portfolio.productName}`] = {
        meterReading: portfolio.meterReading || '',
        productName: portfolio.productName,
      };
    });
    setFormData(initialFormData);
  }, [portfolioList]);

  const handleChange = (productName, event) => {
    const { value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [`meterQuantity_${productName}`]: {
        ...prevFormData[`meterQuantity_${productName}`],
        meterReading: value,
      },
    }));
  };

  const handleSave = () => {
    // Pass the form data to the parent component
    onSave(formData);
    // Clear the form data after saving
    setFormData({});
  };

  return (
    <div className="bg-[var(--neutral-white)] p-4 border-b-2 border-[var(--neutral-gray200)] w-1/2 rounded-md">
      <h3 className="mb-4">Meter Readings</h3>
      <form>
        {portfolioList.map((portfolio) => (
          <div key={portfolio.product_id} className="flex m-4">
            <TextInput
              name={`meterQuantity_${portfolio.productName}`}
              label={`${portfolio.productName} Meter Quantity`}
              value={formData[`meterQuantity_${portfolio.productName}`]?.meterReading || ""}
              onChange={(event) => handleChange(portfolio.productName, event)}
              error={false}
              helperText=""
              disabled={false}
              className="m-3 w-full"
              required
            />
          </div>
        ))}
        <div className="text-right">
          <Button variant="filled" color="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

// PropTypes validation
MeterForm.propTypes = {
  portfolioList: PropTypes.arrayOf(
    PropTypes.shape({
      product_id: PropTypes.string.isRequired,
      productName: PropTypes.string.isRequired,
      meterReading: PropTypes.string,
    })
  ).isRequired,
  onSave: PropTypes.func.isRequired,
};

export default MeterForm;