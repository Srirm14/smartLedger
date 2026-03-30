import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import useGlobalDateStore from "../../../store/useGlobalStore";
import CashflowSummaryCard from "./Components/CashflowSummaryCard";

const SalesSummary = () => {
  const { CashflowSelectedDate } = useGlobalDateStore();

  return (
    <div className="flex-1 flex flex-col">
      <div className="">
        <Card>
          <CardContent className="p-4">
            <div className="space-y-6">
              <CashflowSummaryCard />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesSummary;
