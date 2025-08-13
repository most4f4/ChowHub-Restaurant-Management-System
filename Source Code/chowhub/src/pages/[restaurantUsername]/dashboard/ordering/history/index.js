import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { Modal, Button } from "react-bootstrap";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import AnalyticsBackButton from "@/components/AnalyticsBackButton";
import styles from "./orderHistory.module.css";

const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
const formatTime = (dateString) => new Date(dateString).toLocaleTimeString();

const StatusBadge = ({ status }) => {
  const statusClass = status === "fulfilled" ? styles.statusFulfilled : styles.statusCancelled;
  return <span className={`${styles.statusBadge} ${statusClass}`}>{status}</span>;
};

const renderOrderItems = (items) => {
  if (!items || items.length === 0) return "No items";
  return items
    .map((item) => `${item.quantity} x ${item.name} (${item.variationName})`)
    .join("<br />");
};

const OrderTable = ({ columns, data, onSort, currentSort, sortOrder, onRowClick }) => (
  <div className={styles.tableWrapper}>
    <table className={styles.table}>
      <thead className={styles.tableHeader}>
        <tr>
          {columns.map((col) => (
            <th
              key={col.accessor}
              onClick={() => col.sortable && onSort(col.accessor)}
              className={`${styles.tableHeaderCell} ${col.sortable ? styles.sortableHeader : ""}`}
            >
              {col.header}
              {col.sortable && (
                <span className={styles.sortIcon}>
                  {currentSort === col.accessor ? (
                    sortOrder === "asc" ? (
                      "▲"
                    ) : (
                      "▼"
                    )
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  )}
                </span>
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className={styles.tableBody}>
        {data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className={styles.emptyState}>
              No orders found
            </td>
          </tr>
        ) : (
          data.map((row, i) => {
            const isEven = i % 2 === 0;
            return (
              <tr
                key={row._id}
                className={`${styles.tableRow} ${isEven ? styles.tableRowEven : styles.tableRowOdd}`}
                onClick={() => onRowClick(row)}
              >
                {columns.map((col) => {
                  let value;
                  if (col.accessor === "_id") {
                    value = row._id.slice(-4);
                  } else if (col.accessor.includes(".")) {
                    const [obj, prop] = col.accessor.split(".");
                    value = row[obj]?.[prop];
                  } else {
                    value = row[col.accessor];
                  }
                  const cellContent = col.renderCell ? col.renderCell(value) : value?.toString();
                  return (
                    <td key={col.accessor} className={styles.tableCell}>
                      {typeof cellContent === "string" && cellContent.includes("<br />") ? (
                        <span dangerouslySetInnerHTML={{ __html: cellContent }} />
                      ) : (
                        cellContent
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);

const OrderDetailsModal = ({ order, onClose }) => {
  if (!order) return null;
  return (
    <Modal
      centered
      show={true}
      onHide={onClose}
      className={styles.modal}
      contentClassName={styles.modalContent}
    >
      <Modal.Header className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>Order Details - {order._id}</Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <p>
          <strong>Date:</strong> {formatDate(order.createdAt)}
        </p>
        <p>
          <strong>Time:</strong> {formatTime(order.createdAt)}
        </p>
        <p>
          <strong>Status:</strong> <StatusBadge status={order.status} />
        </p>
        <p>
          <strong>Placed by:</strong> {order.placedBy?.username}
        </p>
        <p>
          <strong>Comment:</strong> {order.comment || "No comments"}
        </p>
        <h5 className={styles.orderItemsTitle}>Order Items</h5>
        <table className={styles.orderItemsTable}>
          <thead>
            <tr>
              <th>Item</th>
              <th>Variation</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.orderLineItems.map((item, index) => (
              <tr key={index}>
                <td>{item.name}</td>
                <td>{item.variationName}</td>
                <td>{item.quantity}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>${item.subTotal.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          <strong>Subtotal:</strong> ${order.subtotal.toFixed(2)}
        </p>
        <p>
          <strong>Tax:</strong> ${order.tax.toFixed(2)}
        </p>
        <p>
          <strong>Total:</strong> ${order.total.toFixed(2)}
        </p>
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
        <Button variant="secondary" onClick={onClose} className={styles.closeButton}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className={styles.pagination}>
    {Array.from({ length: totalPages }, (_, i) => (
      <button
        key={i + 1}
        onClick={() => onPageChange(i + 1)}
        className={`${styles.paginationButton} ${
          currentPage === i + 1 ? styles.paginationButtonActive : ""
        }`}
      >
        {i + 1}
      </button>
    ))}
  </div>
);

const OrderHistoryPage = () => {
  const router = useRouter();
  const { restaurantUsername } = router.query;
  console.log("restaurantUsername:", restaurantUsername);

  const [orders, setOrders] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ status: "", dateFrom: "", dateTo: "" });
  const [tempFilters, setTempFilters] = useState({ status: "", dateFrom: "", dateTo: "" });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  const loadOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        statuses: filters.status,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        sortBy,
        sortOrder,
      }).toString();
      console.log("Fetching orders with URL:", `/order/history?${params}`);
      const response = await apiFetch(`/order/history?${params}`);
      console.log("API response:", response);
      const { orders: allOrders, total, pages } = response;

      const filteredOrders = searchTerm
        ? allOrders.filter((order) => order._id.slice(-4) === searchTerm)
        : allOrders;

      setOrders(filteredOrders);
      setTotalOrders(total);
      setTotalPages(pages);
    } catch (err) {
      console.error("Failed to load orders:", err.message, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady && restaurantUsername) {
      console.log("Triggering loadOrders for:", restaurantUsername);
      loadOrders();
    }
  }, [router.isReady, currentPage, searchTerm, filters, sortBy, sortOrder, restaurantUsername]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filters]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleRowClick = (order) => setSelectedOrder(order);
  const handleCloseModal = () => setSelectedOrder(null);
  const handleStatusChange = (status) => {
    setTempFilters((prev) => ({ ...prev, status }));
  };
  const handleDateFromChange = (e) => {
    setTempFilters((prev) => ({ ...prev, dateFrom: e.target.value }));
  };
  const handleDateToChange = (e) => {
    setTempFilters((prev) => ({ ...prev, dateTo: e.target.value }));
  };
  const handleClearFilters = () => {
    setFilters({ status: "", dateFrom: "", dateTo: "" });
    setTempFilters({ status: "", dateFrom: "", dateTo: "" });
    setIsFilterOpen(false);
  };
  const handleApplyFilters = () => {
    setFilters({ ...tempFilters });
    setIsFilterOpen(false);
  };

  const columns = [
    { header: "Order ID", accessor: "_id" },
    { header: "Date", accessor: "createdAt", renderCell: formatDate, sortable: true },
    { header: "Time", accessor: "createdAt", renderCell: formatTime },
    {
      header: "Status",
      accessor: "status",
      renderCell: (value) => <StatusBadge status={value} />,
      sortable: true,
    },
    {
      header: "Total",
      accessor: "total",
      renderCell: (value) => `${value.toFixed(2)}`,
      sortable: true,
    },
    { header: "Order Items", accessor: "orderLineItems", renderCell: renderOrderItems },
    { header: "Placed by", accessor: "placedBy.username" },
  ];

  return (
    <DashboardLayout>
      <div className={styles.container}>
        <div className={styles.contentWrapper}>
          <div className={styles.backButtonWrapper}>
            <AnalyticsBackButton buttonText="Back to ordering" customBackPath="ordering" />
          </div>

          <h1 className={styles.pageTitle}>🧾 Order History</h1>

          {loading ? (
            <p className={styles.loadingText}>Loading orders…</p>
          ) : (
            <>
              <div className={styles.controlsWrapper}>
                <div className={styles.searchWrapper}>
                  <svg
                    className={styles.searchIcon}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by last 4 digits of order ID, staff username, or item name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>

                <div className={styles.filterButtonWrapper}>
                  <button
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    className={styles.filterButton}
                  >
                    <svg
                      className={styles.filterIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 3H2l8 9.46V19a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2v-6.54L22 3z" />
                    </svg>
                    Filters
                  </button>

                  {isFilterOpen && (
                    <div ref={filterRef} className={styles.filterDropdown}>
                      <div className={styles.filterSection}>
                        <h6 className={styles.filterSectionTitle}>Status</h6>
                        <label className={styles.radioLabel}>
                          <input
                            type="radio"
                            name="status"
                            value="fulfilled"
                            checked={tempFilters.status === "fulfilled"}
                            onChange={() => handleStatusChange("fulfilled")}
                            className={styles.radioInput}
                          />
                          Fulfilled
                        </label>
                        <label className={styles.radioLabel}>
                          <input
                            type="radio"
                            name="status"
                            value="cancelled"
                            checked={tempFilters.status === "cancelled"}
                            onChange={() => handleStatusChange("cancelled")}
                            className={styles.radioInput}
                          />
                          Cancelled
                        </label>
                        <label className={styles.radioLabel}>
                          <input
                            type="radio"
                            name="status"
                            value=""
                            checked={tempFilters.status === ""}
                            onChange={() => handleStatusChange("")}
                            className={styles.radioInput}
                          />
                          All
                        </label>
                      </div>

                      <div className={styles.filterSection}>
                        <h6 className={styles.filterSectionTitle}>Date Range</h6>
                        <div style={{ marginBottom: "1rem" }}>
                          <label className={styles.dateLabel}>From:</label>
                          <input
                            type="date"
                            value={tempFilters.dateFrom}
                            onChange={handleDateFromChange}
                            className={styles.dateInput}
                          />
                        </div>
                        <div>
                          <label className={styles.dateLabel}>To:</label>
                          <input
                            type="date"
                            value={tempFilters.dateTo}
                            onChange={handleDateToChange}
                            className={styles.dateInput}
                          />
                        </div>
                      </div>

                      <div className={styles.filterActions}>
                        <Button
                          variant="secondary"
                          onClick={handleClearFilters}
                          className={styles.clearButton}
                        >
                          Clear
                        </Button>
                        <Button
                          variant="primary"
                          onClick={handleApplyFilters}
                          className={styles.applyButton}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <OrderTable
                columns={columns}
                data={orders}
                onSort={handleSort}
                currentSort={sortBy}
                sortOrder={sortOrder}
                onRowClick={handleRowClick}
              />

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}

              <OrderDetailsModal order={selectedOrder} onClose={handleCloseModal} />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderHistoryPage;
