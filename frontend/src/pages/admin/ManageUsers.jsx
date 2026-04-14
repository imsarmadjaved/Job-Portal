import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faEdit,
  faTrash,
  faSpinner,
  faTimes,
  faCheckCircle,
  faUser,
  faBuilding,
  faShieldAlt,
  faUsers,
  faUserGraduate,
  faBan,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../services/axios";
import { getCompanies } from "../../services/companyService";
import { blockUser, unblockUser } from "../../services/adminService";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../components/ConfirmationModel";

function ManageUsers() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [blockingId, setBlockingId] = useState(null);
  const [companyLogos, setCompanyLogos] = useState({});
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "",
  });

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    config: {},
    onConfirm: null,
  });

  useEffect(() => {
    fetchUsers();
    fetchCompanyLogos();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/users");
      if (response.data.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyLogos = async () => {
    try {
      const response = await getCompanies({ limit: 100 });
      if (response.success && response.companies) {
        const logoMap = {};
        response.companies.forEach((company) => {
          if (company.logo) {
            logoMap[company.user] = company.logo;
            logoMap[company.name] = company.logo;
          }
        });
        setCompanyLogos(logoMap);
      }
    } catch (err) {
      console.error("Error fetching company logos:", err);
    }
  };

  const getCompanyLogo = (user) => {
    if (companyLogos[user._id]) return companyLogos[user._id];
    if (user.companyName && companyLogos[user.companyName])
      return companyLogos[user.companyName];
    return null;
  };

  const showConfirmation = (config) => {
    return new Promise((resolve) => {
      setConfirmModal({
        isOpen: true,
        config,
        onConfirm: () => {
          resolve(true);
          setConfirmModal({ isOpen: false, config: {}, onConfirm: null });
        },
      });
    });
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setEditFormData({ name: user.name, email: user.email, role: user.role });
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdatingId(selectedUser._id);
    try {
      const response = await api.put(
        `/admin/users/${selectedUser._id}`,
        editFormData,
      );
      if (response.data.success) {
        setUsers(
          users.map((user) =>
            user._id === selectedUser._id ? { ...user, ...editFormData } : user,
          ),
        );
        setShowEditModal(false);
      }
    } catch (err) {
      alert("Failed to update user");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBlockUser = async (userId, userName) => {
    const confirmed = await showConfirmation({
      type: "block",
      title: "Block User",
      message: `Are you sure you want to block ${userName}?`,
      details:
        "Blocked users cannot log in or access the platform.\nYou can unblock them later.",
      confirmText: "Block User",
    });

    if (!confirmed) return;

    setBlockingId(userId);
    try {
      const response = await blockUser(userId);
      if (response.success) {
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, status: "blocked" } : user,
          ),
        );
      }
    } catch (err) {
      alert(err.message || "Failed to block user");
    } finally {
      setBlockingId(null);
    }
  };

  const handleUnblockUser = async (userId, userName) => {
    const confirmed = await showConfirmation({
      type: "success",
      title: "Unblock User",
      message: `Are you sure you want to unblock ${userName}?`,
      details: "They will be able to log in and access the platform again.",
      confirmText: "Unblock User",
    });

    if (!confirmed) return;

    setBlockingId(userId);
    try {
      const response = await unblockUser(userId);
      if (response.success) {
        setUsers(
          users.map((user) =>
            user._id === userId ? { ...user, status: "active" } : user,
          ),
        );
      }
    } catch (err) {
      alert(err.message || "Failed to unblock user");
    } finally {
      setBlockingId(null);
    }
  };

  const handleDeleteUser = async (userId, userName, userRole) => {
    if (currentAdmin && userId === currentAdmin._id) {
      alert("You cannot delete your own account.");
      return;
    }

    if (userRole === "admin") {
      const adminCount = users.filter((u) => u.role === "admin").length;
      if (adminCount <= 1) {
        alert("Cannot delete the last admin.");
        return;
      }
    }

    let details =
      "This will permanently delete their profile and all applications.";
    if (userRole === "employer") {
      details =
        "This will permanently delete:\n• Their company profile\n• All jobs posted\n• All applications for those jobs";
    }

    const confirmed = await showConfirmation({
      type: "danger",
      title: "Delete User",
      message: `Are you sure you want to delete ${userName}?`,
      details: details + "\n\nThis action CANNOT be undone.",
      confirmText: "Delete User",
    });

    if (!confirmed) return;

    setDeletingId(userId);
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      if (response.data.success) {
        setUsers(users.filter((user) => user._id !== userId));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.companyName &&
        user.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role) => {
    const styles = {
      job_seeker: "bg-green-50 text-green-700 border-green-200",
      employer: "bg-purple-50 text-purple-700 border-purple-200",
      admin: "bg-red-50 text-red-700 border-red-200",
    };
    const labels = {
      job_seeker: "Job Seeker",
      employer: "Employer",
      admin: "Admin",
    };
    const icons = {
      job_seeker: faUserGraduate,
      employer: faBuilding,
      admin: faShieldAlt,
    };
    return (
      <span
        className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit font-medium border ${styles[role]}`}
      >
        <FontAwesomeIcon icon={icons[role]} className="w-3 h-3" />
        {labels[role]}
      </span>
    );
  };

  const getUserAvatar = (user) => {
    if (user.role === "employer") {
      const companyLogo = getCompanyLogo(user);
      if (companyLogo)
        return (
          <img
            src={companyLogo}
            alt=""
            className="w-10 h-10 rounded-lg object-cover border border-secondary-200"
          />
        );
    }
    if (user.profileImage) {
      return (
        <img
          src={user.profileImage}
          alt=""
          className="w-10 h-10 rounded-full object-cover border border-secondary-200"
        />
      );
    }
    const roleStyles = {
      job_seeker: "from-green-400 to-green-600 rounded-full",
      employer: "from-purple-400 to-purple-600 rounded-lg",
      admin: "from-red-400 to-red-600 rounded-full",
    };
    const roleIcons = {
      job_seeker: faUserGraduate,
      employer: faBuilding,
      admin: faShieldAlt,
    };
    return (
      <div
        className={`w-10 h-10 flex items-center justify-center bg-gradient-to-br ${roleStyles[user.role]} shadow-sm`}
      >
        <FontAwesomeIcon
          icon={roleIcons[user.role] || faUser}
          className="text-white text-sm"
        />
      </div>
    );
  };

  const isCurrentAdmin = (user) =>
    currentAdmin && user._id === currentAdmin._id;
  const isLastAdmin = (user) =>
    user.role === "admin" &&
    users.filter((u) => u.role === "admin").length <= 1;
  const canDeleteUser = (user) =>
    !isCurrentAdmin(user) && !(user.role === "admin" && isLastAdmin(user));
  const canBlockUser = (user) =>
    !isCurrentAdmin(user) &&
    !(user.role === "admin" && isLastAdmin(user)) &&
    user.status !== "blocked";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading Users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-secondary-900">
          Manage Users
        </h1>
        <p className="text-secondary-500 text-sm mt-1">
          View, edit, and manage all users
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400 text-sm"
            />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200 text-sm"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-48 px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white"
          >
            <option value="all">All Roles</option>
            <option value="job_seeker">Job Seekers</option>
            <option value="employer">Employers</option>
            <option value="admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-secondary-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary-50 border-b border-secondary-200">
              <tr>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider hidden md:table-cell">
                  Joined
                </th>
                <th className="px-4 sm:px-5 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className={`hover:bg-secondary-50 transition-all ${user.status === "blocked" ? "bg-red-50/30" : ""}`}
                  >
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-3">
                        {getUserAvatar(user)}
                        <div>
                          <span className="font-medium text-secondary-900 text-sm">
                            {user.name}
                            {isCurrentAdmin(user) && (
                              <span className="ml-2 text-xs text-blue-600 font-normal">
                                (You)
                              </span>
                            )}
                          </span>
                          <p className="text-xs text-secondary-500 md:hidden mt-0.5">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-sm text-secondary-600">
                      {user.email}
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      {user.status === "blocked" ? (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5 w-fit font-medium">
                          <FontAwesomeIcon icon={faBan} className="w-3 h-3" />{" "}
                          Blocked
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 flex items-center gap-1.5 w-fit font-medium">
                          <FontAwesomeIcon
                            icon={faCheckCircle}
                            className="w-3 h-3"
                          />{" "}
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 sm:px-5 py-4 text-sm text-secondary-500 hidden md:table-cell">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                          title="Edit"
                        >
                          <FontAwesomeIcon icon={faEdit} className="text-sm" />
                        </button>

                        {user.status === "blocked" ? (
                          <button
                            onClick={() =>
                              handleUnblockUser(user._id, user.name)
                            }
                            disabled={
                              blockingId === user._id || isCurrentAdmin(user)
                            }
                            className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                            title="Unblock"
                          >
                            {blockingId === user._id ? (
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin text-sm"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faCheckCircle}
                                className="text-sm"
                              />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleBlockUser(user._id, user.name)}
                            disabled={
                              blockingId === user._id || !canBlockUser(user)
                            }
                            className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-all disabled:opacity-50"
                            title="Block"
                          >
                            {blockingId === user._id ? (
                              <FontAwesomeIcon
                                icon={faSpinner}
                                className="animate-spin text-sm"
                              />
                            ) : (
                              <FontAwesomeIcon
                                icon={faBan}
                                className="text-sm"
                              />
                            )}
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleDeleteUser(user._id, user.name, user.role)
                          }
                          disabled={
                            deletingId === user._id || !canDeleteUser(user)
                          }
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-50"
                          title="Delete"
                        >
                          {deletingId === user._id ? (
                            <FontAwesomeIcon
                              icon={faSpinner}
                              className="animate-spin text-sm"
                            />
                          ) : (
                            <FontAwesomeIcon
                              icon={faTrash}
                              className="text-sm"
                            />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-5 py-16 text-center text-secondary-500"
                  >
                    <FontAwesomeIcon
                      icon={faUsers}
                      className="text-4xl text-secondary-300 mb-3"
                    />
                    <p className="text-base font-medium text-secondary-700">
                      No users found
                    </p>
                    <p className="text-sm text-secondary-400 mt-1">
                      Try adjusting your filters
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-secondary-100">
              <h2 className="text-lg font-bold text-secondary-900">
                Edit User
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-full hover:bg-secondary-100 flex items-center justify-center text-secondary-500 hover:text-secondary-700 transition-all"
              >
                <FontAwesomeIcon icon={faTimes} className="text-base" />
              </button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={editFormData.email}
                    onChange={handleEditChange}
                    required
                    className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1.5">
                    Role
                  </label>
                  <select
                    name="role"
                    value={editFormData.role}
                    onChange={handleEditChange}
                    className="w-full px-4 py-2.5 border border-secondary-200 rounded-lg focus:outline-none focus:border-primary-500 text-sm bg-white"
                  >
                    <option value="job_seeker">Job Seeker</option>
                    <option value="employer">Employer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6 pt-2">
                <button
                  type="submit"
                  disabled={updatingId === selectedUser._id}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 text-sm"
                >
                  {updatingId === selectedUser._id
                    ? "Saving..."
                    : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-5 py-2.5 border border-secondary-200 rounded-lg text-secondary-600 hover:bg-secondary-50 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() =>
          setConfirmModal({ isOpen: false, config: {}, onConfirm: null })
        }
        onConfirm={confirmModal.onConfirm}
        config={confirmModal.config}
      />
    </div>
  );
}

export default ManageUsers;
