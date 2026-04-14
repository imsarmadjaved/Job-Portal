import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faTrash,
  faBan,
  faCheckCircle,
  faTimes,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";

function ConfirmModal({ isOpen, onClose, onConfirm, config }) {
  if (!isOpen) return null;

  const {
    type = "warning",
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    details = null,
  } = config || {};

  const typeConfig = {
    danger: {
      icon: faTrash,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      confirmButton: "bg-red-600 hover:bg-red-700",
    },
    warning: {
      icon: faExclamationTriangle,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
      confirmButton: "bg-yellow-600 hover:bg-yellow-700",
    },
    block: {
      icon: faBan,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      confirmButton: "bg-orange-600 hover:bg-orange-700",
    },
    success: {
      icon: faCheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      confirmButton: "bg-green-600 hover:bg-green-700",
    },
    info: {
      icon: faQuestionCircle,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      confirmButton: "bg-blue-600 hover:bg-blue-700",
    },
  };

  const currentType = typeConfig[type] || typeConfig.warning;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          {/* Icon */}
          <div
            className={`w-16 h-16 ${currentType.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}
          >
            <FontAwesomeIcon
              icon={currentType.icon}
              className={`${currentType.iconColor} text-2xl`}
            />
          </div>

          {/* Title */}
          <h3 className="text-xl font-bold text-secondary-900 mb-2">{title}</h3>

          {/* Message */}
          <p className="text-secondary-600 text-sm mb-4 whitespace-pre-line">
            {message}
          </p>

          {/* Additional Details (optional) */}
          {details && (
            <div className="bg-secondary-50 rounded-lg p-3 mb-4 text-left">
              <p className="text-xs text-secondary-500 whitespace-pre-line">
                {details}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-secondary-200 rounded-lg text-secondary-600 hover:bg-secondary-50 transition-all text-sm font-medium"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-4 py-2.5 ${currentType.confirmButton} text-white rounded-lg transition-all text-sm font-medium`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
