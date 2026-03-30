import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GA_TRACKING_ID = 'G-YMWFF7P07L';

const getPageTitle = (pathname) => {
  const pathMap = {
    '/': 'Dashboard',
    '/login': 'Login',
    '/forgot-password': 'Forgot Password',
    '/customer': 'Customer Management',
    '/inventory': 'Inventory Management',
    '/product': 'Product Management',
    '/reports': 'Reports',
    '/staff': 'Staff Management',
    '/tally': 'Tally Integration',
    '/cashflow': 'Cashflow Management',
    '/portfolio': 'Portfolio Management',
    '/employee': 'Employee Management',
    '/bank-account': 'Bank Account Management',
    '/mode': 'Payment Mode Management',
    '/meter-reading': 'Meter Reading',
    '/stock-management': 'Stock Management',
    '/credit': 'Credit Management',
    '/island': 'Island Management',
  };

  // Find exact match first
  if (pathMap[pathname]) {
    return pathMap[pathname];
  }

  // Find partial matches for nested routes
  for (const [path, title] of Object.entries(pathMap)) {
    if (pathname.startsWith(path) && path !== '/') {
      return title;
    }
  }

  // Default fallback
  return 'Smart Ledger';
};

// Update document title
const updateDocumentTitle = (pageTitle) => {
  if (typeof document !== 'undefined') {
    document.title = `${pageTitle} - Smart Ledger`;
  }
};

// Initialize GA4
export const initGA = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('GA4 Debug: GA4 already initialized');
    return;
  }
  
  // Check if gtag is available
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('GA4 Debug: GA4 is available');
  } else {
    console.log('GA4 Debug: GA4 not available - check if script loaded');
  }
};

// Track page views with proper screen name and title
export const trackPageView = (url, customTitle = null) => {
  if (typeof window !== 'undefined' && window.gtag) {
    const pathname = url.split('?')[0]; // Remove query parameters
    const pageTitle = customTitle || getPageTitle(pathname);
    const screenName = pageTitle; // Use same title for screen name
    
    // Update document title
    updateDocumentTitle(pageTitle);
    
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
      page_title: pageTitle,
      screen_name: screenName,
    });
    
    console.log('GA4 Debug: Page view tracked:', {
      url,
      page_title: pageTitle,
      screen_name: screenName
    });
  }
};

// Track custom events
export const trackEvent = (action, category, label, value) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
    console.log('GA4 Debug: Event tracked:', { action, category, label, value });
  }
};

// React component for automatic page tracking
const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA4
    initGA();
    
        // Track page view on route change with proper title
    trackPageView(location.pathname + location.search , getPageTitle(location.pathname));
  }, [location]);

  return null; // This component doesn't render anything
};

export default GoogleAnalytics; 