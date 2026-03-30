import React from "react";

/**
 * Backdrop Component
 * Renders a blurred, semi-transparent background overlay
 * @param {string} className - Additional class names for customization
 */
const Backdrop = ({ className = "" }) => (
  <div
    className={`fixed inset-0 z-40 bg-black/5 dark:bg-black/20 backdrop-blur-sm ${className}`}
    aria-hidden="true"
  />
);

export default Backdrop; 