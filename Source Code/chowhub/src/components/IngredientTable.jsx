import React from "react";
import styles from "./IngredientTable.module.css";

export default function IngredientTable({ ingredients, onEdit, onDelete }) {
  const columns = [
    { header: "Name", accessor: "name" },
    { header: "Image", accessor: "image" },
    { header: "Unit", accessor: "unit" },
    { header: "Quantity", accessor: "quantity" },
    { header: "Threshold", accessor: "threshold" },
  ];

  const getStockStatus = (ingredient) => {
    const { quantity, threshold } = ingredient;
    if (quantity <= threshold) return "critical";
    if (quantity <= threshold * 1.1) return "warning";
    return "good";
  };

  const getRowClassName = (ingredient, index) => {
    const status = getStockStatus(ingredient);
    const isEven = index % 2 === 0;

    if (status === "critical") return styles.rowCritical;
    if (status === "warning") return styles.rowWarning;
    return isEven ? styles.rowEven : styles.rowNormal;
  };

  const renderStatusIndicator = (ingredient) => {
    const status = getStockStatus(ingredient);
    const statusConfig = {
      critical: { label: "Critical", className: styles.statusCritical, icon: "⚠️" },
      warning: { label: "Low", className: styles.statusWarning, icon: "⚡" },
      good: { label: "Good", className: styles.statusGood, icon: "✅" },
    };

    const config = statusConfig[status];
    return (
      <span className={`${styles.statusIndicator} ${config.className}`}>
        <span>{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const renderActions = (row, index) => (
    <div className={styles.actionsContainer}>
      <button
        onClick={() => onEdit(row)}
        className={`${styles.actionButton} ${styles.editButton}`}
        title={`Edit ${row.name}`}
        aria-label={`Edit ${row.name} ingredient`}
      >
        <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
        </svg>
      </button>
      <button
        onClick={() => onDelete(row)}
        className={`${styles.actionButton} ${styles.deleteButton}`}
        title={`Delete ${row.name}`}
        aria-label={`Delete ${row.name} ingredient`}
      >
        <svg className={styles.actionIcon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
        </svg>
      </button>
    </div>
  );

  // Calculate stats for footer
  const stats = ingredients.reduce(
    (acc, ingredient) => {
      const status = getStockStatus(ingredient);
      acc.total++;
      if (status === "critical") acc.critical++;
      if (status === "warning") acc.warning++;
      if (status === "good") acc.good++;
      return acc;
    },
    { total: 0, critical: 0, warning: 0, good: 0 },
  );

  // Show empty state if no ingredients
  if (ingredients.length === 0) {
    return (
      <div className={styles.tableContainer}>
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>🥕</div>
          <div className={styles.emptyStateTitle}>No ingredients yet</div>
          <div className={styles.emptyStateText}>
            Start building your inventory by adding your first ingredient
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
            <th className={styles.headerCell}>Status</th>
            <th className={styles.headerCell}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((row, index) => {
            const rowClassName = getRowClassName(row, index);

            return (
              <tr key={index} className={`${styles.tableRow} ${rowClassName}`}>
                {columns.map((col) => {
                  const cellValue = row[col.accessor];

                  if (col.accessor === "image") {
                    return (
                      <td key={col.accessor} className={styles.imageCell}>
                        {cellValue ? (
                          <img src={cellValue} alt={row.name} className={styles.ingredientImage} />
                        ) : (
                          <div className={styles.noImage}>No Image</div>
                        )}
                      </td>
                    );
                  }

                  // Apply specific styling for different cell types
                  let cellClassName = styles.tableCell;
                  if (col.accessor === "name") cellClassName += ` ${styles.nameCell}`;
                  if (col.accessor === "quantity") cellClassName += ` ${styles.quantityCell}`;
                  if (col.accessor === "threshold") cellClassName += ` ${styles.thresholdCell}`;
                  if (col.accessor === "unit") cellClassName += ` ${styles.unitCell}`;

                  return (
                    <td key={col.accessor} className={cellClassName}>
                      {cellValue}
                    </td>
                  );
                })}

                {/* Status column */}
                <td className={styles.tableCell}>{renderStatusIndicator(row)}</td>

                {/* Actions column */}
                <td className={styles.actionsCell}>{renderActions(row, index)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Table footer with stats */}
      <div className={styles.tableFooter}>
        <div className={styles.footerStats}>
          <div className={styles.footerStat}>
            <span>Total:</span>
            <span className={styles.footerStatValue}>{stats.total}</span>
          </div>
          <div className={styles.footerStat}>
            <span>🟢 Good:</span>
            <span className={styles.footerStatValue}>{stats.good}</span>
          </div>
          <div className={styles.footerStat}>
            <span>🟡 Low:</span>
            <span className={styles.footerStatValue}>{stats.warning}</span>
          </div>
          <div className={styles.footerStat}>
            <span>🔴 Critical:</span>
            <span className={styles.footerStatValue}>{stats.critical}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
