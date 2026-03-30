import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Table,
  ArrowLeft,
  LoaderCircle,
  CircleAlert,
  Rocket,
  Download,
  MoreVertical,
  Printer,
  FileText,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import FuelTable from "./FuelTable";
import OtherProductsTable from "./OtherProductsTable";
import PaymentSummaryTable from "./PaymentSummaryTable";
import usePortfolioSalesTallyStore from "../../../store/usePortfolioSalesTallyStore";
import { usePortfolioStore } from "../../../store/usePortfolioStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import useGlobalDateStore from "../../../store/useGlobalStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TallyPage = () => {
  const [progress, setProgress] = React.useState(13);
  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate();
  const { portfolioName } = useParams();
  const tallySummary = usePortfolioSalesTallyStore(
    (state) => state.tallySummary
  ); 
  const loading = usePortfolioSalesTallyStore((state) => state.loading); 
  const [isExportMode, setIsExportMode] = useState(false);

  const fetchTallySummary = usePortfolioSalesTallyStore(
    (state) => state.fetchTallySummary
  );
  const { IslandSelectedDate } = useGlobalDateStore();
  const { activeShiftState } = usePortfolioStore();
  const [textIndex, setTextIndex] = useState(0);
  const texts = [
    "Generating your report... Hang tight!",
    "Crunching numbers... Almost there!",
    "Fetching insights... Stay tuned!",
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTextIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shiftId = activeShiftState?.shift_id || ''; 
        const portfolioId = activeShiftState?.portfolio_id || '';
        await fetchTallySummary(portfolioId, IslandSelectedDate, shiftId);
      } catch (error) {
        console.error("Error fetching tally summary:", error);
      }
    };
    fetchData();
  }, [fetchTallySummary, IslandSelectedDate, portfolioName,activeShiftState]);

  const goBack = () => {
    navigate(-1);
  };

  const generateFileName = () => {
    const date = new Date(IslandSelectedDate);
    const formattedDate = date.toISOString().split('T')[0];
    return `tally-report-${portfolioName}-${formattedDate}`;
  };

  const downloadAsPDF = async () => {
    try {
      const element = document.querySelector('#tally-page');
      setIsExportMode(true);
      
      const opt = {
        margin: [10, 15, 10, 15], // top, right, bottom, left margins
        filename: `${generateFileName()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          dpi: 300,
          windowWidth: 1200,
          windowHeight: 1600
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { mode: 'avoid-all' }
      };

      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(opt).from(element).save();
      
      setTimeout(() => {
        setIsExportMode(false);
      }, 1000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setIsExportMode(false);
    }
  };

  const printPage = () => {
    window.print();
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 min-h-[200px]">
        <Rocket className="text-[var(--secondary-600)] h-8 w-8 mb-4 animate-pulse" />
        <Progress
          value={progress}
          className="w-[60%] bg-[var(--neutral-gray300)] max-w-[500px]"
        />
        <p className="text-sm font-medium mt-4 text-[var(--secondary-400)]">
          {texts[textIndex]}
        </p>
      </div>
    );
  }
  if (!tallySummary || !tallySummary.length) {
    return (
      <div className="mt-6 mx-4">
        <Alert className="flex flex-col gap-1 border-[var(--danger-300)]">
          <CircleAlert color="var(--danger-500)" strokeWidth={1.75} />
          <AlertTitle className="text-[var(--danger-500)] ml-2">
            Internal Server Error
          </AlertTitle>
          <AlertDescription className="ml-2">
            Due to an internal issue, we were unable to process the tally
            report. Try again later or contact support if the issue persists.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Process the data from tallySummary[0]
  const salesData = tallySummary[0] ? Object.values(tallySummary[0]) : [];
  
  // Separate fuel and other products data
  const fuelData = salesData.filter(item => item.category?.toLowerCase() === 'fuel');
  const otherProductsData = salesData.filter(item => item.category?.toLowerCase() !== 'fuel');

  return (
    <div
      id="tally-page"
      className={`p-5 min-h-screen ${isExportMode ? "export-mode" : ""}`}
    >
      <style>
        {`
          @media print {
            .back-button,
            .export-button,
            .dropdown-menu {
              display: none !important;
            }
          }
          
          .export-mode {
            font-size: 12px;
            line-height: 1.4;
            max-width: 100%;
            overflow-x: visible !important;
          }
          
          .export-mode table {
            width: 100% !important;
            max-width: 100% !important;
            font-size: 10px !important;
            border-collapse: collapse !important;
            margin-bottom: 15px !important;
          }
          
          .export-mode table th,
          .export-mode table td {
            border: 1px solid #e0e0e0 !important;
            padding: 6px 8px !important;
            text-align: left !important;
          }
          
          .export-mode table th {
            background-color: #f5f5f5 !important;
            font-weight: 600 !important;
          }
          
          .export-mode .tally-header {
            margin-bottom: 20px !important;
            border-bottom: 2px solid #e0e0e0 !important;
            padding-bottom: 10px !important;
          }
        `}
      </style>
      <div className="flex items-center justify-between bg-[var(--neutral-white)] p-3 rounded-t-md border-[1.4px] border-[var(--neutral-gray200)] border-b-0 shadow-sm tally-header">
        <span className="flex gap-4">
          {!isExportMode && (
            <button
              className="flex items-center text-[var(--neutral-gray600)] hover:text-[var(--neutral-gray800)] back-button hide-on-print transition-colors"
              onClick={goBack}
            >
              <ArrowLeft size={18} strokeWidth={2} className="mr-1" />
            </button>
          )}
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-[var(--neutral-gray800)]">Tally Report</span>
            <span className="text-sm text-[var(--neutral-gray500)]">{formatDate(IslandSelectedDate)}</span>
          </div>
        </span>

        <div className="flex items-center gap-2">
          {!isExportMode && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-md hover:bg-[var(--neutral-gray100)] transition-colors hide-on-print"
                  title="More options"
                >
                  <MoreVertical
                    size={22}
                    strokeWidth={2}
                    className="text-[var(--secondary-600)] hover:text-[var(--secondary-600)] transition-colors"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 hide-on-print">
                <DropdownMenuItem onClick={downloadAsPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Download as PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={printPage}>
                  <Printer className="mr-2 h-4 w-4" />
                  <span>Print</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <div className="bg-[var(--neutral-white)] border-[1.4px] border-[var(--neutral-gray200)] rounded-b-md py-6">
        <FuelTable fuelData={fuelData} />
        <OtherProductsTable otherProductsData={otherProductsData} />
        <PaymentSummaryTable data={[tallySummary[1], tallySummary[2]]} />
      </div>
    </div>
  );
};

export default TallyPage;
