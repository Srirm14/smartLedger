"use client"

import { BarChart3, Box, Briefcase, IndianRupee, ShoppingCart, Users, UsersRound, Banknote } from "lucide-react"

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar"
import { NavMain } from "./nav-main"
import { UserDomain } from "./user-domain"
import { UserActions } from "./user-actions"

// This is sample data.
const data = {
  user: {
    name: "John Doe",
    email: "m@example.com",
    avatar: "https://github.com/shadcn.png",
  },
  organization: "My Org",
  navMain: [
    {
      title: "Product",
      url: "/product-management",
      icon: ShoppingCart,
      items: [],
    },
    {
      title: "Inventory",
      url: "/inventory-management",
      icon: Box,
      items: [],
    },
    {
      title: "Staff",
      url: "/staff-management",
      icon: UsersRound,
      items: [],
    },
    {
      title: "Island",
      url: "/island-management",
      icon: Briefcase,
      items: [],
    },
    {
      title: "Customer",
      url: "/customer-management",
      icon: Users,
      items: [],
    },
    {
      title: "Credit",
      url: "/global-credit",
      icon: IndianRupee,
      items: [],
    },
    {
      title: "CashFlow",
      url: "/cashflow",
      icon: Banknote,
      items: [],
    },
    {
      title: "Reports",
      url: "/reports",
      icon: BarChart3,
      items: [],
    },

  ],
}

export function AppSidebar({ ...props }) {
  const { state } = useSidebar()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <UserDomain />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <UserActions user={data.user} organization={data.organization} isCollapsed={state} />
      </SidebarFooter>
    </Sidebar>
  )
}

