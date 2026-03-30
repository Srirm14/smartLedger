import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { InventoryManagement } from "@/pages/Product/ProductPricing/InventoryManagement";
import ProductDetails from "@/pages/Product/ProductDetails/ProductDetails";
import CustomerRecentCredit from "@/pages/Credit/CustomerRecentCredit";
import { AppHeader } from "./app-header";
import SettingsLayout from "@/pages/Domain/Settings/SettingsLayout";
import { AppFooter } from "./app-footer";
import ReportsLayout from "@/pages/Reports";
import { IslandDetails } from "@/pages/Island/IslandManagement/island-details";
import { IslandManagement } from "@/pages/Island/IslandManagement/island-management";
import ProfileLayout from "@/pages/Domain/Profile/ProfileLayout";
import { InventoryStockManagement } from "@/pages/Inventory/inventory-stock-management";
import StaffLayout from "@/pages/Staff/StaffLayout/staff-layout";
import { InventoryDetails } from "@/pages/Inventory/inventory-details";
import Cashflow from "@/pages/Cashflow/Cashflow";
import TallyPage from "@/pages/Tally/TallyPage";
import CustomerDetails from "@/pages/Customer/CustomerCreditDetails/CustomerDetails";
import CustomerOrganization from "@/pages/Customer/CustomerManagement";

export default function AppLayout() {
  const location = useLocation();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {location.pathname !== "/settings" && <AppHeader />}
        <main className="flex-grow bg-[var(--neutral-gray50)] dark:bg-[var(--neutral-gray900)] scrollbar-thin">
          <Routes>
            <Route path="/" element={<Navigate to="/product-management" />} />
            <Route
              path="/product-management"
              element={<InventoryManagement />}
            />
            <Route
              path="/inventory-management"
              element={<InventoryStockManagement />}
            />
            <Route
              path="/inventory-management/:management"
              element={<InventoryDetails />}
            />
            <Route
              path="/product-management/:product"
              element={<ProductDetails />}
            />
            <Route path="/staff-management" element={<StaffLayout />} />
            <Route path="/island-management" element={<IslandManagement />} />
            <Route
              path="/island-management/:portfolioName"
              element={<IslandDetails />}
            />
            <Route
              path="/island-management/:portfolioName/:tally"
              element={<TallyPage />}
            />
            <Route
              path="/customer-management"
              element={<CustomerOrganization />}
            />
            <Route path="/global-credit" element={<CustomerRecentCredit />} />
            <Route
              path="/customer-management/:customerName/:customer_id"
              element={<CustomerDetails />}
            />
            <Route path="/reports" element={<ReportsLayout />} />
            <Route path="/cashflow" element={<Cashflow />} />
            <Route path="/settings/*" element={<SettingsLayout />} />
            <Route path="/user-profile/*" element={<ProfileLayout />} />
          </Routes>
        </main>
        <AppFooter />
      </SidebarInset>
    </SidebarProvider>
  );
}
