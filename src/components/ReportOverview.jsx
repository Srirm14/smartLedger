import PropTypes from 'prop-types';
import { useNavigate, useParams } from "react-router-dom";
import Button from "./Button/Button"; // Import the Button component

const ReportOverview = ({ tallyData }) => {
  const navigate = useNavigate();
  const { portfolioName } = useParams();


  const handleViewReport = () => {
    const tallyValue = `tally-${portfolioName}`;
    navigate(`/island-management/${portfolioName}/list/${tallyValue}`);
  };

 



  return (
    <div className="bg-[var(--neutral-white)] p-4 rounded-lg border-[1.2px] border-[var(--neutral-gray200)] w-fit mb-14">
      <div className="text-sm mb-4 pb-2 border-b-[1.2px] border-[var(--neutral-gray200)]">
        Sales Tally Report
      </div>
      <div className="flex justify-evenly items-stretch">
        <div className="grid grid-cols-5 gap-3 items-center mb-4">
          <div className="text-sm text-[var(--neutral-gray600)]">Overall Payment Received:</div>
          <div className="text-sm text-[var(--neutral-gray600)] text-center">-</div>
          <div className="text-sm text-[var(--neutral-gray600)]">Overall Sales:</div>
          <div className="text-sm text-[var(--neutral-gray600)] text-center">=</div>
          <div className="text-sm text-[var(--neutral-gray600)]">Total Balance:</div>
          <div className="text-sm font-semibold">
            ₹{tallyData.overall_payment_received || 0}
          </div>
          <div className="text-sm font-semibold text-center">-</div>
          <div className="text-sm font-semibold">
            ₹{tallyData.total_sales || 0}
          </div>
          <div className="text-sm font-semibold text-center">=</div>
          <div className="text-sm font-semibold">
            ₹{tallyData.overall_payment_received - tallyData.total_sales || 0}
          </div>
        </div>
      </div>
      <div className="text-right flex justify-end">
        {/* <div className="flex-auto text-right mr-5">
          <Button onClick={handleRedo} variant="primary" nature="outlined" size="s">Redo</Button>
        </div> */}
        <div className="justify-end">
          <Button 
          onClick={handleViewReport}
          nature="outlined" 
          size="s" 
          disabled={Object.keys(tallyData).length === 0}
          >
            View Report
          </Button>
        </div>
      </div>
    </div>
  );
};

// Define prop types
ReportOverview.propTypes = {
  tallyData: PropTypes.shape({
    overall_payment_received: PropTypes.number.isRequired,
    total_sales: PropTypes.number.isRequired,
  }).isRequired,
  handleRedo: PropTypes.func.isRequired,
};

export default ReportOverview;