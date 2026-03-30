import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import useGlobalDateStore from "../../../store/useGlobalStore";
import GlobalDatePicker from "@/components/Date-Picker/GlobalDatePicker";

export function AppHeader() {
  const selectedDate = useGlobalDateStore((state) => state.selectedDate);
  const setSelectedDate = useGlobalDateStore((state) => state.setSelectedDate);
  const location = useLocation();

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  const generateBreadcrumbs = () => {
    const segments = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
    
    const breadcrumbs = segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      
      const decodedSegment = decodeURIComponent(segment);
      const label = decodedSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
        
      return { href, label };
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-[5] flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 bg-[var(--neutral-white)] dark:bg-[var(--neutral-gray900)] border-b border-[var(--neutral-gray200)] dark:border-[var(--neutral-gray700)]">
      <div className="flex items-center gap-2 px-4 flex-1">
        <SidebarTrigger className="-ml-1" />
       
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/">
               
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={breadcrumb.href}>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbPage>
                      {breadcrumb.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={breadcrumb.href}>
                      {breadcrumb.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="px-4">
        <GlobalDatePicker
          selectedDate={selectedDate}
          onChange={handleDateChange}
        />
      </div>
    </header>
  );
}
