import React from "react";

function EmptyState({
  icon = "🔍",
  title = "No results found",
  description = "Try adjusting your search or filters to find what you're looking for.",
  buttonText = "Clear all filters",
  onButtonClick,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-secondary-200 p-16 text-center animate-fade-in">
      <div className="text-7xl mb-6 animate-float">{icon}</div>
      <h3 className="text-2xl font-bold text-secondary-900 mb-3">{title}</h3>
      <p className="text-secondary-500 mb-6 max-w-md mx-auto">{description}</p>
      {onButtonClick && (
        <button
          onClick={onButtonClick}
          className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-all transform hover:scale-105 shadow-md"
        >
          {buttonText}
        </button>
      )}
    </div>
  );
}

export default EmptyState;
