import { useState } from "react";
import GlobalDatePicker from "@/components/Date-Picker/GlobalDatePicker";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StaffHeader({ 
  activeTab, 
  setActiveTab, 
  currentDate, 
  setCurrentDate,
  showTabs = true,
  title = "Staff Management",
  subtitle = "Manage your organization's employees here. View, add, edit, and delete employee information as needed.",
  onBack,
  employeeName,
  showDatePicker = false
}) {
  return (
    <header className="bg-white border-b w-full">
      <div className="w-full pt-6 px-4 md:px-6 lg:px-10">
        <div className="flex w-full justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            {onBack && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onBack}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex flex-col gap-1">
              <h1 className="text-lg font-semibold text-gray-900">
                {employeeName ? `${employeeName}'s Records` : title}
              </h1>
              <p className="text-sm text-gray-500">
                {employeeName ? "Manage Staff Attendance and Salary Records" : subtitle}
              </p>
            </div>
          </div>

          {/* Date picker - only shown when showDatePicker is true */}
          {showDatePicker && (
            <div className="flex-shrink-0">
              <GlobalDatePicker 
                selectedDate={currentDate} 
                onChange={setCurrentDate} 
                displayDate={currentDate} 
              />
            </div>
          )}
        </div>

        {/* Tabs - only shown when showTabs is true */}
        {showTabs && (
          <div className="flex overflow-x-auto -mb-[1px]">
            <button
              className={`px-3 md:px-6 py-3 font-medium text-sm whitespace-nowrap relative border-b-2 transition-colors duration-200 ${
                activeTab === "directory"
                  ? "border-black text-primary"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("directory")}
            >
              Staff Directory
            </button>
            {/* <button
              className={`px-3 md:px-6 py-3 font-medium text-sm whitespace-nowrap relative border-b-2 transition-colors duration-200 ${
                activeTab === "attendance"
                  ? "border-black text-primary"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("attendance")}
            >
              Attendance Tracker
            </button> */}
          </div>
        )}
      </div>
    </header>
  );
} 