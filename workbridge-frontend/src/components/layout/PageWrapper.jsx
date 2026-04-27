import React from "react";

// Ensure 'export default' is at the very beginning
export default function PageWrapper({ 
  children, 
  maxWidth = 1100, 
  className = "",
  fluid = false // Added this prop back so your Chat UI can be edge-to-edge
}) {
  return (
    <div className={`w-full min-h-full ${className}`}>
      <div 
        className={`mx-auto ${fluid ? "p-0" : "px-4 sm:px-6 lg:px-8 py-8"}`} 
        style={{ 
          maxWidth: fluid ? "none" : maxWidth,
          width: "100%" 
        }}
      >
        {/* The animation wrapper ensures a smooth entrance for your content */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </div>
    </div>
  );
}