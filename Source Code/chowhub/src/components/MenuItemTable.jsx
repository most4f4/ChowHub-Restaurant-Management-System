import React, { useState } from "react";
import { FaEdit, FaTrash, FaEye, FaEyeSlash, FaSearch } from "react-icons/fa";
import Style from "./MenuItemTable.module.css";

export default function MenuItemTable({ items, onEdit, onDelete }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const columns = [
    { header: "Name", accessor: "name", className: Style.nameColumn },
    { header: "Image", accessor: "image", className: Style.imageColumn },
    { header: "Category", accessor: "categoryName", className: Style.categoryColumn },
    { header: "Price Range", accessor: "priceRange", className: Style.priceColumn },
    { header: "Inventory", accessor: "isInventoryControlled", className: Style.inventoryColumn },
    { header: "Variations", accessor: "variations", className: Style.variationsColumn },
    { header: "Actions", accessor: "actions", className: Style.actionsColumn },
  ];

  const renderActions = (item) => (
    <div className={Style.actionContainer}>
      <button
        onClick={() => onEdit(item)}
        className={`${Style.actionButton} ${Style.editButton}`}
        title="Edit item"
      >
        <FaEdit size={14} />
      </button>
      <button
        onClick={() => onDelete(item)}
        className={`${Style.actionButton} ${Style.deleteButton}`}
        title="Delete item"
      >
        <FaTrash size={14} />
      </button>
    </div>
  );

  // Helper function to get the correct quantity display for an ingredient
  const getIngredientDisplay = (ingredient) => {
    if (ingredient.track) {
      return `${ingredient.quantityUsed || 0} ${ingredient.unit || ""}`.trim();
    } else {
      if (ingredient.unit) {
        return `${ingredient.quantityUsed || 0} ${ingredient.unit}`;
      } else if (ingredient.quantityOriginal) {
        return ingredient.quantityOriginal;
      }
      return "";
    }
  };

  const getRowClassName = (item, index) => {
    const { variations = [] } = item;

    const isCritical = variations.some((v) =>
      v.ingredients?.some((ing) => ing.track && ing.quantityUsed <= ing.threshold),
    );

    const isLow =
      !isCritical &&
      variations.some((v) =>
        v.ingredients?.some(
          (ing) =>
            ing.track &&
            ing.quantityUsed <= ing.threshold * 1.1 &&
            ing.quantityUsed > ing.threshold,
        ),
      );

    if (isCritical) return `${Style.tableRow} ${Style.tableRowCritical}`;
    if (isLow) return `${Style.tableRow} ${Style.tableRowLow}`;
    return `${Style.tableRow} ${index % 2 === 0 ? Style.tableRowEven : Style.tableRowOdd}`;
  };

  if (!items || items.length === 0) {
    return (
      <div className={Style.tableContainer}>
        <div className={Style.emptyState}>
          <FaSearch size={40} style={{ marginBottom: "1rem", opacity: 0.5 }} />
          <p>No menu items found</p>
        </div>
      </div>
    );
  }

  return (
    <div className={Style.tableContainer}>
      <table className={Style.table}>
        <thead className={Style.tableHead}>
          <tr>
            {columns.map((col) => (
              <th key={col.accessor} className={`${Style.tableHeaderCell} ${col.className}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const { variations = [] } = item;

            const prices = variations.map((v) => parseFloat(v.price)).filter((n) => !isNaN(n));
            const priceRange =
              prices.length === 0
                ? "-"
                : prices.length === 1
                  ? `$${prices[0].toFixed(2)}`
                  : `$${Math.min(...prices).toFixed(2)} - $${Math.max(...prices).toFixed(2)}`;

            const isExpanded = expandedRow === item._id;

            return (
              <React.Fragment key={item._id || index}>
                <tr className={getRowClassName(item, index)}>
                  <td className={`${Style.tableCell} ${Style.nameColumn}`}>
                    <strong>{item.name}</strong>
                  </td>
                  <td className={`${Style.tableCellCenter} ${Style.imageColumn}`}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className={Style.menuImage} />
                    ) : (
                      <div style={{ color: "#666", fontStyle: "italic" }}>No image</div>
                    )}
                  </td>
                  <td className={`${Style.tableCell} ${Style.categoryColumn}`}>
                    {item.categoryName}
                  </td>
                  <td className={`${Style.tableCell} ${Style.priceColumn}`}>
                    <span className={Style.priceRange}>{priceRange}</span>
                  </td>
                  <td className={`${Style.tableCellCenter} ${Style.inventoryColumn}`}>
                    <span
                      className={`${Style.inventoryBadge} ${
                        item.isInventoryControlled ? Style.inventoryYes : Style.inventoryNo
                      }`}
                    >
                      {item.isInventoryControlled ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className={`${Style.tableCellCenter} ${Style.variationsColumn}`}>
                    <button
                      onClick={() =>
                        setExpandedRow((prev) => (prev === item._id ? null : item._id))
                      }
                      className={Style.viewButton}
                    >
                      {isExpanded ? (
                        <>
                          <FaEyeSlash size={12} style={{ marginRight: "0.25rem" }} />
                          Hide
                        </>
                      ) : (
                        <>
                          <FaEye size={12} style={{ marginRight: "0.25rem" }} />
                          View
                        </>
                      )}
                    </button>
                  </td>
                  <td className={`${Style.tableCellCenter} ${Style.actionsColumn}`}>
                    {renderActions(item)}
                  </td>
                </tr>
                {isExpanded &&
                  variations.map((v, vi) => (
                    <tr key={`v-${item._id}-${vi}`} className={Style.expandedRow}>
                      <td colSpan={7} className={Style.expandedContent}>
                        <div className={Style.variationTitle}>
                          🍽️ <strong>Variation:</strong> {v.name}
                        </div>
                        <div style={{ marginBottom: "1rem" }}>
                          <span className={Style.variationPrice}>
                            💰 Price: ${parseFloat(v.price || 0).toFixed(2)}
                          </span>
                          {" • "}
                          <span className={Style.variationCost}>
                            📊 Cost: ${parseFloat(v.cost || 0).toFixed(2)}
                          </span>
                        </div>

                        <div className={Style.ingredientsTitle}>
                          🥘 <strong>Ingredients:</strong>
                        </div>
                        {v.ingredients && v.ingredients.length > 0 ? (
                          <ul className={Style.ingredientsList}>
                            {v.ingredients.map((ing, ii) => (
                              <li key={`ing-${ii}`} className={Style.ingredientItem}>
                                {ing.track && <span className={Style.trackIcon}>🔍</span>}
                                <span>
                                  {ing.name}
                                  {getIngredientDisplay(ing) && (
                                    <span style={{ color: "#aaa" }}>
                                      {" — "}
                                      {getIngredientDisplay(ing)}
                                    </span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p style={{ color: "#888", fontStyle: "italic", marginLeft: "1.5rem" }}>
                            No ingredients listed
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
