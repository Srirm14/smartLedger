"use client";

import { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, User, MoreVertical } from "lucide-react";
import { useAuthStore } from "../../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import { getOrganisationName } from "@/services/apiService";
import { Skeleton } from "@/components/ui/skeleton";

export function UserActions({ user, isCollapsed }) {
  const { logoutAction } = useAuthStore();
  const navigate = useNavigate();
  const [organization, setOrganization] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrganisationName()
      .then((res) => {
        setOrganization(res.organisation);
      })
      .catch(() => setOrganization("N/A"))
      .finally(() => setLoading(false));
  }, []);

  const handleViewProfile = useCallback(() => {
    navigate("/user-profile");
  }, [navigate]);

  const handleSettings = useCallback(() => {
    navigate("/settings");
  }, [navigate]);

  const handleLogout = useCallback(() => {
    logoutAction();
  }, [logoutAction]);

  const org = {
    name: organization,
    email: "nandakishore@gmail.com",
    avatar: "/placeholder-avatar.jpg",
  };

  const MenuItems = () => (
    <>
      <DropdownMenuItem onClick={handleViewProfile}>
        <User className="mr-2 h-4 w-4" />
        View Profile
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleSettings}>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </DropdownMenuItem>
    </>
  );

  if (isCollapsed === "collapsed") {
    return (
      <div className="flex justify-center p-2 hover:cursor-pointer border-t-[1px] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <Avatar className="h-8 w-8 text-secondary-600">
                <AvatarImage src={org.avatar} alt={org.name} />
                <AvatarFallback  className="text-[var(--secondary-400)] dark:text-[var(--secondary-400)]">{org.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="start" forceMount>
            <MenuItems />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 p-2 hover:cursor-pointer border-t-[1px] border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
      <Avatar className="h-8 w-8">
        <AvatarImage src={org.avatar} alt={org.name} />
        <AvatarFallback className="text-[var(--secondary-400)] dark:text-[var(--secondary-400)]">
          {org.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        {loading ? (
          <Skeleton className="h-4 w-24 bg-[var(--neutral-gray200)] dark:bg-[var(--neutral-gray700)]" />
        ) : (
          <h2 className="text-sm font-medium text-[var(--neutral-gray900)] dark:text-[var(--neutral-gray100)] transition-all">
            {org.name.replace(/\b\w/g, (char) => char.toUpperCase())}
          </h2>
        )}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-52" forceMount>
          <MenuItems />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
