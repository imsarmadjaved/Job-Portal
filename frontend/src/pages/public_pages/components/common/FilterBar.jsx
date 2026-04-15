import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSlidersH,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

function FilterBar({
  showFilters,
  setShowFilters,
  hasActiveFilters,
  onClearFilters,
  sortBy,
  onSortChange,
  sortOptions = [
    { value: "latest", label: "Latest" },
    { value: "salary-high", label: "Salary: High to Low" },
    { value: "salary-low", label: "Salary: Low to High" },
  ],
  viewMode,
  onViewModeChange,
  children,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-secondary-200 mb-6 overflow-hidden">
      <div className="p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-secondary-600 hover:text-primary-600 transition-all px-4 py-2 rounded-lg hover:bg-primary-50"
          >
            <FontAwesomeIcon icon={faSlidersH} />
            <span className="font-medium">Filters</span>
            <FontAwesomeIcon
              icon={showFilters ? faChevronUp : faChevronDown}
              className="text-xs"
            />
          </button>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium px-3 py-1 rounded-lg hover:bg-primary-50 transition-all"
            >
              Clear all filters
            </button>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-sm text-secondary-500">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="text-sm border border-secondary-200 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500 bg-white cursor-pointer hover:border-primary-300 transition-all"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 border-l border-secondary-200 pl-6">
            <button
              onClick={() => onViewModeChange("grid")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-primary-50 text-primary-600 shadow-sm"
                  : "text-secondary-400 hover:bg-secondary-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => onViewModeChange("list")}
              className={`p-2.5 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-primary-50 text-primary-600 shadow-sm"
                  : "text-secondary-400 hover:bg-secondary-50"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="border-t border-secondary-200 p-6 bg-gradient-to-r from-secondary-50 to-white">
          {children}
        </div>
      )}
    </div>
  );
}

export default FilterBar;
