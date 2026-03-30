// components/ScrollableApp.js
import React from "react";
import "./index.scss";

const ScrollableApp = ({ children }) => {
  return (
    <div className="scrollbar-thin h-screen">
      {children}
    </div>
  );
};

export default ScrollableApp;
