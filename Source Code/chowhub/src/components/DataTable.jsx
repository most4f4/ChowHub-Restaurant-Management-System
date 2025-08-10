// src/components/DataTable.js
import React from "react";

export default function DataTable({ columns, data, renderActions }) {
  return (
    <div
      style={{
        overflowX: "auto",
        backgroundColor: "#1E1E2F",
        borderRadius: 8,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
        }}
      >
        <thead
          style={{
            backgroundColor: "#2A2A3A",
          }}
        >
          <tr>
            {columns.map((col) => {
              // right-align numeric or date columns
              const align = ["Amount", "Date"].includes(col.header) ? "right" : "left";
              return (
                <th
                  key={col.accessor}
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: align,
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.8)",
                    fontWeight: 600,
                    borderBottom: "1px solid #3A3A4A",
                  }}
                >
                  {col.header}
                </th>
              );
            })}
            {renderActions && (
              <th
                style={{
                  padding: "0.75rem 1rem",
                }}
              />
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const isEven = i % 2 === 0;
            return (
              <tr
                key={i}
                style={{
                  backgroundColor: isEven ? "transparent" : "rgba(255,255,255,0.03)",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = isEven
                    ? "transparent"
                    : "rgba(255,255,255,0.03)")
                }
              >
                {columns.map((col) => {
                  const cell = row[col.accessor];

                  if (col.render) {
                    return (
                      <td
                        key={col.accessor}
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          color: "#EEE",
                          fontSize: "0.95rem",
                        }}
                      >
                        {col.render(cell, row)}
                      </td>
                    );
                  }

                  // special render for status
                  if (col.accessor === "status") {
                    const bgColor = cell === "Active" ? "#4CAF50" : "#E53935";
                    return (
                      <td key={col.accessor} style={{ padding: "0.75rem 1rem", textAlign: "left" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.25rem 0.75rem",
                            backgroundColor: bgColor,
                            color: "#FFF",
                            borderRadius: 12,
                            fontSize: "0.85rem",
                            fontWeight: 500,
                          }}
                        >
                          {cell}
                        </span>
                      </td>
                    );
                  }

                  // numeric/date alignment
                  const align = ["username", "email", "role", "fullName", "phone"].includes(
                    col.accessor,
                  )
                    ? "left"
                    : ["status"]
                      ? "left"
                      : ["Amount", "Date"].includes(col.header)
                        ? "right"
                        : "left";

                  return (
                    <td
                      key={col.accessor}
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: align,
                        color: "#EEE",
                        fontSize: "0.95rem",
                      }}
                    >
                      {cell}
                    </td>
                  );
                })}

                {renderActions && (
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "center",
                    }}
                  >
                    {renderActions(row)}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
