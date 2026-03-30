import React from "react";
import { ChevronLeft } from "lucide-react"; // You can use any icon library or custom icon
import { useNavigate, useParams } from "react-router-dom"; // Import useNavigate hook

const TabMenu = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate(); // Initialize the navigate function
  const { portfolioName } = useParams();

  const handleBackClick = () => {
    navigate(-1); // Navigate to the previous route
  };

  return (
    <div className="flex items-center bg-[var(--neutral-white)] rounded-t-lg mt-10 justify-between py-4 px-4 border-[1.2px] border-[var(--neutral-gray200)] dark:bg-[var(--neutral-gray900)] dark:border-[var(--neutral-gray700)]">
      {/* Left side with back icon */}
      <button
        onClick={handleBackClick} // Handle back button click
        className="flex items-center text-[var(--neutral-gray500)] hover:text-[var(--neutral-gray700)] dark:text-[var(--neutral-gray400)] dark:hover:text-[var(--neutral-gray200)] transition-all duration-200"
      >
        <ChevronLeft size={20} />
        <div className="flex items-center gap-2 ml-2">
          <span>Back</span>
          <span className="text-[var(--neutral-gray400)] dark:text-[var(--neutral-gray500)]">|</span>
          <span className="font-semibold">{portfolioName}</span>
        </div>
      </button>

      {/* Right side with tab buttons */}
      <div className="flex space-x-4">
        <button
          className={`tab text-center py-2 px-4 text-sm font-medium transition-all duration-200 ease-in-out ${
            activeTab === "Sales Products"
              ? "text-[var(--primary-500)] border-b-2 border-[var(--primary-500)] opacity-100"
              : "text-[var(--neutral-gray400)] dark:text-[var(--neutral-gray500)] opacity-50 hover:opacity-100"
          } max-w-[150px] w-fit h-fit`}
          onClick={() => setActiveTab("Sales Products")}
        >
          Sales Products
        </button>
        <button
          className={`tab text-center py-2 px-4 text-sm font-medium transition-all duration-200 ease-in-out ${
            activeTab === "Cashflow"
              ? "text-[var(--primary-500)] border-b-2 border-[var(--primary-500)] opacity-100"
              : "text-[var(--neutral-gray400)] dark:text-[var(--neutral-gray500)] opacity-50 hover:opacity-100"
          } max-w-[150px] w-fit h-fit`}
          onClick={() => setActiveTab("Cashflow")}
        >
          Cashflow
        </button>
      </div>
    </div>
  );
};

export default TabMenu;
