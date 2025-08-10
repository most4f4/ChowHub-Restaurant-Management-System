import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Container, Row, Col } from "react-bootstrap";
import {
  FiUsers,
  FiUserCheck,
  FiUserX,
  FiSearch,
  FiFilter,
  FiPlus,
  FiEdit3,
  FiMail,
  FiPhone,
} from "react-icons/fi";

import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import DataTable from "@/components/DataTable";
import { apiFetch } from "@/lib/api";
import styles from "./userManagement.module.css";

export default function UserManagementPage() {
  const router = useRouter();
  const { restaurantUsername } = router.query;

  // State for users and totals
  const [users, setUsers] = useState([]);
  const [totals, setTotals] = useState({ total: 0, active: 0, deactivated: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    async function load() {
      try {
        const { users: list, total } = await apiFetch("/users?page=1&limit=100");
        setUsers(list);

        const activeCount = list.filter((u) => u.isActive).length;
        setTotals({
          total,
          active: activeCount,
          deactivated: total - activeCount,
        });
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Filter users based on search and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === "all" || user.role === filterRole;

    return matchesSearch && matchesRole;
  });

  // Prepare rows for DataTable
  const rows = filteredUsers.map((u) => ({
    fullName: `${u.firstName} ${u.lastName}`,
    username: u.username,
    email: u.email,
    role: u.role,
    status: u.isActive ? "Active" : "Inactive",
    phone: u.phone,
    emergencyContact: u.emergencyContact,
    _id: u._id,
  }));

  const columns = [
    {
      header: "User",
      accessor: "fullName",
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 600, color: "#fff", marginBottom: "0.25rem" }}>{value}</div>
          <div style={{ fontSize: "0.85rem", color: "#a8b2c1" }}>@{row.username}</div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessor: "email",
      render: (value, row) => (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.25rem",
              color: "#a8b2c1",
              fontSize: "0.9rem",
            }}
          >
            <FiMail size={14} />
            {value}
          </div>
          {row.phone && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#a8b2c1",
                fontSize: "0.9rem",
              }}
            >
              <FiPhone size={14} />
              {row.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Role",
      accessor: "role",
      render: (value) => (
        <span
          className={`${styles.roleBadge} ${value === "manager" ? styles.roleManager : styles.roleStaff}`}
        >
          {value === "manager" ? "👔 Manager" : "👥 Staff"}
        </span>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (value) => (
        <span
          className={`${styles.statusBadge} ${value === "Active" ? styles.statusActive : styles.statusInactive}`}
        >
          {value === "Active" ? "✅ Active" : "❌ Inactive"}
        </span>
      ),
    },
    {
      header: "Emergency Contact",
      accessor: "emergencyContact",
      render: (value) => (
        <span style={{ color: "#a8b2c1", fontSize: "0.9rem" }}>{value || "—"}</span>
      ),
    },
  ];

  const SummaryCard = ({ icon, label, value, color }) => (
    <div className={styles.summaryCard} style={{ "--card-color": color }}>
      <div className={styles.cardContent}>
        <div className={styles.cardIcon}>{icon}</div>
        <div className={styles.cardInfo}>
          <div className={styles.cardValue}>{value}</div>
          <p className={styles.cardLabel}>{label}</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <ManagerOnly>
          <div className={styles.pageContainer}>
            <div className={styles.loadingContainer}>
              <div className={styles.loadingSpinner}></div>
              <h3 className={styles.loadingTitle}>Loading Users...</h3>
              <p className={styles.loadingSubtitle}>
                Fetching user data and calculating statistics
              </p>
            </div>
          </div>
        </ManagerOnly>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ManagerOnly>
        <div className={styles.pageContainer}>
          {/* Header Section */}
          <div className={styles.headerSection}>
            <div className={styles.headerIcon}>
              <FiUsers size={28} />
            </div>
            <div>
              <h1 className={styles.headerTitle}>User Management</h1>
              <p className={styles.headerSubtitle}>
                Manage your restaurant staff, roles, and permissions
              </p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className={styles.summaryContainer}>
            <SummaryCard
              icon={<FiUsers />}
              label="Total Users"
              value={totals.total}
              color="#4CAF50"
            />
            <SummaryCard
              icon={<FiUserCheck />}
              label="Active Users"
              value={totals.active}
              color="#2196F3"
            />
            <SummaryCard
              icon={<FiUserX />}
              label="Inactive Users"
              value={totals.deactivated}
              color="#F44336"
            />
          </div>

          {/* Action Bar */}
          <div className={styles.actionBar}>
            <div className={styles.actionBarLeft}>
              <div className={styles.searchContainer}>
                <FiSearch className={styles.searchIcon} size={16} />
                <input
                  type="text"
                  placeholder="Search users by name, email, or username..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <select
                className={styles.filterButton}
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="manager">👔 Managers</option>
                <option value="staff">👥 Staff</option>
              </select>
            </div>

            <button
              className={styles.createButton}
              onClick={() => router.push(`/${restaurantUsername}/dashboard/user-management/create`)}
            >
              <FiPlus size={18} />
              Create New User
            </button>
          </div>

          {/* Data Table */}
          <div className={styles.tableContainer}>
            <div className={styles.tableHeader}>
              <h3 className={styles.tableHeaderTitle}>
                <FiUsers size={20} />
                Team Members ({filteredUsers.length})
              </h3>
            </div>

            <DataTable
              columns={columns}
              data={rows}
              renderActions={(row) => (
                <button
                  className={styles.editButton}
                  onClick={() =>
                    router.push({
                      pathname: `/${restaurantUsername}/dashboard/user-management/edit/${row.username}`,
                      query: {
                        fullName: row.fullName,
                        username: row.username,
                        email: row.email,
                        role: row.role,
                        userStatus: row.status,
                        phone: row.phone,
                        emergencyContact: row.emergencyContact,
                        _id: row._id,
                      },
                    })
                  }
                  title="Edit User"
                >
                  <FiEdit3 size={16} />
                </button>
              )}
            />
          </div>

          {/* Results Info */}
          {searchTerm || filterRole !== "all" ? (
            <div
              style={{
                textAlign: "center",
                marginTop: "1rem",
                color: "#a8b2c1",
                fontSize: "0.9rem",
              }}
            >
              Showing {filteredUsers.length} of {users.length} users
              {searchTerm && ` matching "${searchTerm}"`}
              {filterRole !== "all" && ` filtered by ${filterRole}`}
            </div>
          ) : null}
        </div>
      </ManagerOnly>
    </DashboardLayout>
  );
}
