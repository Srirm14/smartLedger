import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import BankingPayments from "./BankingPayments";
import IslandShiftConfiguration from "./IslandShiftConfiguration";
import { SidebarTrigger } from "@/components/ui/sidebar";

const SettingsLayout = () => {
  const [selectedSection, setSelectedSection] = useState("Islands & Shifts");
  const tabsRef = useRef(null);

  const navigation = [
    {
      label: "Islands & Shifts",
      content: "Manage Island and shift configurations",
      disabled: false,
    },
    {
      label: "Banking & Accounts",
      content: "Manage linked bank account details",
      disabled: false,
    },
  ];

  // Check if current path is active
  const isPathActive = (path) => {
    return location.pathname === path;
  };

  const handleNavigationClick = (label) => {
    setSelectedSection(label);
  };
  
  // Get current section content and label based on path
  const getCurrentSection = () => {
    const currentSection = navigation.find(
      (item) => item.path === location.pathname
    );
    return currentSection || navigation.find(item => !item.disabled);
  };

  useEffect(() => {
    if (tabsRef.current) {
      setTimeout(() => {
        const activeTabIndex = navigation.findIndex(
          (navItem) => navItem.label === selectedSection
        );
        const activeTab = tabsRef.current.children[activeTabIndex];
        if (activeTab) {
          activeTab.classList.add("text-primary", "font-bold");
        }
        // Remove any existing indicators
        tabsRef.current.querySelectorAll(".active-indicator").forEach((indicator) => {
          indicator.remove();
        });
        // Add the active indicator only for the active tab
        if (activeTab) {
          const activeTabIndicator = document.createElement("div");
          activeTabIndicator.className = "absolute bottom-0 left-0 z-10 h-0.5 bg-black active-indicator";
          activeTabIndicator.style.width = `${activeTab.offsetWidth}px`;
          activeTabIndicator.style.left = `${activeTab.offsetLeft}px`;
          tabsRef.current.appendChild(activeTabIndicator);
        }
      }, 100); // Wait for 100ms to ensure DOM is fully rendered
    }
  }, [selectedSection, tabsRef]);

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Header */}
      <nav className="sticky top-0 z-10 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center relative gap-2 p-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
        {/* Tabs */}
        <div ref={tabsRef} className="flex relative px-4">
          {navigation.map((item) => (
            <button
              key={item.label}
              className={`px-3 md:px-6 py-2 font-medium text-sm whitespace-nowrap relative z-0 transition-colors duration-200 ${
                selectedSection === item.label
                  ? "text-primary font-bold"
                  : "text-gray-500"
              } ${item.disabled ? "pointer-events-none opacity-50" : ""}`}
              onClick={() => handleNavigationClick(item.label)}
              disabled={item.disabled}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="max-w-5xl w-full mx-auto py-10 px-10">
          <p className="font-semibold text-md border-b-[1.3px] border-gray-300 py-6">
            {navigation.find((item) => item.label === selectedSection)?.content}
          </p>

          <div className="scrollbar-thin">
            {selectedSection === "Islands & Shifts" && (
              <IslandShiftConfiguration />
            )}
            {selectedSection === "Banking & Accounts" && (
              <BankingPayments />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsLayout;