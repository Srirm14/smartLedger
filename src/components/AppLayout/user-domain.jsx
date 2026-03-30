import { useMemo, useEffect, useState } from "react";
import SmartLedgerLogo from "../../assets/logo/SmartLedger.svg";
import SmartLedgerTitleLogo from "../../assets/logo/SmartLedgerTitle.svg";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";

export function UserDomain() {
  const { state } = useSidebar();
  const [isLoaded, setIsLoaded] = useState(false);

  // Memoize the logo source to prevent unnecessary re-renders
  const logoSrc = useMemo(() => {
    return state === "collapsed" ? SmartLedgerTitleLogo : SmartLedgerLogo;
  }, [state]);

  // Preload both images to avoid flickering
  useEffect(() => {
    const preloadImage = (src) => {
      const img = new Image();
      img.src = src;
    };
    preloadImage(SmartLedgerLogo);
    preloadImage(SmartLedgerTitleLogo);
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="justify-start">
          {/* Logo container with shine effect */}
          <div className="relative overflow-hidden">
            <img
              src={logoSrc}
              alt="Smart Ledger Logo"
              onLoad={() => setIsLoaded(true)}
              onError={(e) => (e.target.src = "/assets/logo/placeholder.svg")} // Fallback in case of error
              style={{
                visibility: isLoaded ? "visible" : "hidden",
                width: state === "collapsed" ? "35px" : "100px", // Adjust width based on state
                height: state === "collapsed" ? "40px" : "44px",  // Adjust height based on state
                objectFit: "contain", // Ensures logo scales properly
              }}
              className="relative z-10"
            />
            {/* Shine effect overlay */}
            <div className="absolute inset-0 z-20 animate-shine bg-gradient-to-r from-transparent via-[var(--neutral-white)]/20 to-transparent dark:via-[var(--neutral-gray100)]/20"></div>
          </div>
          {!isLoaded && <div className="placeholder">Loading...</div>} {/* Optional placeholder */}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
