import React from "react";
import styles from "./VariationTable.module.css";

export default function VariationTable({ variations = [], onEdit, onDelete }) {
  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Price", accessor: "price" },
    { header: "Cost", accessor: "cost" },
    { header: "Ingredients", accessor: "ingredients" },
  ];

  const renderActions = (row, index) => (
    <div className={styles.actionsContainer}>
      <button
        onClick={() => onEdit(row)}
        className={`${styles.actionButton} ${styles.editButton}`}
        title="Edit variation"
        aria-label={`Edit ${row.name} variation`}
      >
        <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      </button>
      <button
        onClick={() => onDelete(row)}
        className={`${styles.actionButton} ${styles.deleteButton}`}
        title="Delete variation"
        aria-label={`Delete ${row.name} variation`}
      >
        <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
      </button>
    </div>
  );

  // Helper function to safely format prices/costs
  const formatCurrency = (value) => {
    if (typeof value === "number" && !isNaN(value)) {
      return value.toFixed(2);
    }
    return "0.00"; // Default value in case of invalid or missing price/cost
  };

  // Show empty state if no variations
  if (variations.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🍽️</div>
          <div className={styles.emptyStateTitle}>No variations yet</div>
          <div className={styles.emptyStateText}>Add your first variation to get started</div>
          <div className={styles.emptyStateSubtext}>
            Variations help you offer different sizes, styles, or options for this menu item
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
          <tr>
            {columns.map((col) => (
              <th key={col.accessor} className={styles.headerCell}>
                {col.header}
              </th>
            ))}
            <th className={styles.headerCell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {variations.map((row, index) => (
            <tr key={index} className={styles.tableRow}>
              <td className={`${styles.tableCell} ${styles.nameCell}`}>{row.name}</td>
              <td className={`${styles.tableCell} ${styles.priceCell}`}>
                ${formatCurrency(row.price)}
              </td>
              <td className={`${styles.tableCell} ${styles.costCell}`}>
                ${formatCurrency(row.cost)}
              </td>
              <td className={`${styles.tableCell} ${styles.ingredientsCell}`}>
                <span className={styles.ingredientCount}>
                  {row.ingredients?.length || 0} item
                  {(row.ingredients?.length || 0) !== 1 ? "s" : ""}
                </span>
              </td>
              <td className={styles.tableCell}>{renderActions(row, index)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Optional: Add table stats/summary */}
      <div className={styles.tableStats}>
        <div className={styles.statsItem}>
          <span>Total Variations:</span>
          <span className={styles.statsValue}>{variations.length}</span>
        </div>
        <div className={styles.statsItem}>
          <span>Avg Price:</span>
          <span className={styles.statsValue}>
            $
            {variations.length > 0
              ? (
                  variations.reduce((sum, v) => sum + (parseFloat(v.price) || 0), 0) /
                  variations.length
                ).toFixed(2)
              : "0.00"}
          </span>
        </div>
      </div>
    </div>
  );
}
