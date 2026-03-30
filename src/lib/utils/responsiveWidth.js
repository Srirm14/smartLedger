import useUIStore from '@/store/useUIStore';

export const getResponsiveWidth = () => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  
  // Base padding for all screen sizes
  const basePadding = '1rem';
  const largePadding = '2rem';
  
  // Sidebar width when open
  const sidebarWidth = '16rem';
  
  // Calculate width based on sidebar state
  const width = isSidebarOpen 
    ? `calc(100vw - ${sidebarWidth} - ${basePadding})`
    : `calc(100vw - ${basePadding})`;
    
  return {
    base: `max-w-[${width}]`,
    lg: `lg:max-w-[calc(100vw - ${isSidebarOpen ? sidebarWidth : '0'} - ${largePadding})]`,
    xl: `xl:max-w-[calc(100vw - ${isSidebarOpen ? sidebarWidth : '0'} - ${largePadding})]`,
    full: `w-full`
  };
}; 