import React from "react";
import { Separator } from "../ui/separator";

export const AppFooter = () => {
  return (
    <footer>
      <Separator />
      <div className="flex items-center justify-between h-12 px-4 bg-[var(--neutral-gray50)] dark:bg-[var(--neutral-gray900)]">
        <div className="text-sm text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]">
          ⓒ 2025 Smart Ledger. All rights reserved by Vyzify.
        </div>
        <div className="text-sm text-[var(--neutral-gray500)] dark:text-[var(--neutral-gray400)]">
          Version 0.0.2
        </div>
      </div>
    </footer>
  );
};
