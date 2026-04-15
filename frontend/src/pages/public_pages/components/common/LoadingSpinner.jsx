import React from "react";

function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-secondary-600">{message}</p>
      </div>
    </div>
  );
}

export default LoadingSpinner;
