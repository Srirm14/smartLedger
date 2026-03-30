// NavMain.jsx
"use client";

import { ChevronRight } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export function NavMain({ items }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const handleItemClick = (path) => {
    navigate(path);
    setActivePath(path);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              onClick={() => handleItemClick(item.url)}
              className={`group/button ${
                activePath.startsWith(item.url)
                  ? "bg-[var(--primary-100)] text-[var(--primary-600)] dark:text-[var(--primary-600)] dark:bg-[var(--primary-100)] font-medium ring-1 ring-[var(--primary-500)]"
                  : "hover:ring-[var(--primary-200)] dark:hover:ring-[var(--primary-300)]"
              } hover:bg-[var(--primary-100)] dark:hover:bg-[var(--primary-100)] hover:ring-1 dark:hover:ring-1`}
            >
              {item.icon && (
                <item.icon
                  className={`mr-2 ${
                    activePath.startsWith(item.url) ? "font-semibold" : ""
                  }`}
                />
              )}
              <span>{item.title}</span>
              {/* Remove ChevronRight as there are no subitems */}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
