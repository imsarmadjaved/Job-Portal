import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function StatsCard({
  icon,
  value,
  label,
  gradient = "from-primary-100 to-primary-200",
}) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-lg border border-secondary-100 hover:shadow-xl transition-all transform hover:-translate-y-1">
      <div
        className={`w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mx-auto mb-4`}
      >
        <FontAwesomeIcon icon={icon} className="text-primary-600 text-2xl" />
      </div>
      <div className="text-4xl font-bold text-secondary-900 mb-2">{value}</div>
      <div className="text-secondary-500 font-medium">{label}</div>
    </div>
  );
}

export default StatsCard;
