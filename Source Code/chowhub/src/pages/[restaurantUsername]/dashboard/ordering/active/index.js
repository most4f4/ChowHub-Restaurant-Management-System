import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { toast } from "react-toastify";
import {
  FaTimes,
  FaCheck,
  FaThumbtack,
  FaClipboardList,
  FaArrowLeft,
  FaArrowRight,
} from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import Style from "./active.module.css"; // New CSS module
import MenuStyle from "../../menu-management/menuManage.module.css"; // For modal styles
import Head from "next/head";
import AnalyticsBackButton from "@/components/AnalyticsBackButton";

function timeSince(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  let interval = Math.floor(seconds / 3600);
  if (interval > 1) return interval + " hrs ago";
  interval = Math.floor(seconds / 60);
  if (interval > 1) return interval + " mins ago";
  return "just now";
}

function getBorderColor(date) {
  const minutesPassed = Math.floor((new Date() - new Date(date)) / 60000);
  if (minutesPassed < 10) return "#4CAF50";
  if (minutesPassed < 20) return "#FFB74D";
  if (minutesPassed < 30) return "#FF8A65";
  if (minutesPassed < 40) return "#FF7043";
  return "#E53935";
}

function getBorderClass(date) {
  const minutesPassed = Math.floor((new Date() - new Date(date)) / 60000);
  if (minutesPassed < 10) return Style.orderCardGreen;
  if (minutesPassed < 20) return Style.orderCardYellow;
  if (minutesPassed < 30) return Style.orderCardOrange;
  if (minutesPassed < 40) return Style.orderCardRed;
  return Style.orderCardCritical;
}

export default function ActiveOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(() => {});
  const [confirmMessage, setConfirmMessage] = useState("");
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const scrollContainerRef = useRef(null);

  const loadOrders = async () => {
    try {
      const res = await apiFetch("/order/active");
      setOrders(res);
    } catch (err) {
      toast.error("Failed to fetch active orders");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const askConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setConfirmModalOpen(true);
  };

  const handleFulfill = async (id) => {
    askConfirm("Are you sure you want to mark this order as fulfilled?", async () => {
      try {
        await apiFetch(`/order/${id}/complete`, { method: "PATCH" });
        toast.success("Order marked fulfilled");
        loadOrders();
      } catch {
        toast.error("Failed to mark fulfilled");
      }
    });
  };

  const handleCancel = async (id) => {
    askConfirm("Are you sure you want to cancel this order?", async () => {
      try {
        await apiFetch(`/order/${id}/cancel`, { method: "PATCH" });
        toast.success("Order cancelled");
        loadOrders();
      } catch {
        toast.error("Failed to cancel order");
      }
    });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: 300, behavior: "smooth" });
      setTimeout(() => {
        setShowLeftArrow(container.scrollLeft > 0);
      }, 300);
    }
  };

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: -300, behavior: "smooth" });
      setTimeout(() => {
        setShowLeftArrow(container.scrollLeft > 0);
      }, 300);
    }
  };

  return (
    <DashboardLayout>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Patrick+Hand&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className={Style.container}>
        <div className={Style.backButtonContainer}>
          <AnalyticsBackButton buttonText="Back to ordering" customBackPath="ordering" />
        </div>
        <h1 className={Style.pageTitle}>📋 Active Orders</h1>

        <div className={Style.scrollWrapper}>
          <div
            ref={scrollContainerRef}
            className={Style.scrollContainer}
            onScroll={() => {
              const container = scrollContainerRef.current;
              setShowLeftArrow(container.scrollLeft > 0);
            }}
          >
            {orders.map((order) => {
              const borderColor = getBorderColor(order.createdAt);
              const borderClass = getBorderClass(order.createdAt);

              return (
                <div
                  key={order._id}
                  className={`${Style.orderCard} ${borderClass}`}
                  style={{
                    border: `2px solid ${borderColor}`,
                    boxShadow: `0 0 12px ${borderColor}`,
                  }}
                >
                  <div className={Style.pinIcon}>
                    <FaThumbtack size={12} />
                  </div>

                  <div className={Style.orderContent}>
                    <div className={Style.orderHeader}>
                      <h3 className={Style.orderTitle}>Order #{order._id.slice(-4)}</h3>
                      <div className={Style.orderMeta}>
                        <strong>By:</strong> {order.placedBy?.username || "Unknown"} <br />
                        <strong>Placed:</strong>{" "}
                        {new Date(order.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        ({timeSince(order.createdAt)})
                      </div>
                    </div>

                    <div className={Style.divider} />

                    <div className={Style.orderItems}>
                      {order.orderLineItems.map((item, idx) => (
                        <div key={idx} className={Style.orderItem}>
                          <span>
                            • {item.quantity} x {item.name}{" "}
                            {item.variationName && (
                              <em className={Style.itemVariation}>({item.variationName})</em>
                            )}
                          </span>
                          <span>${item.subTotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className={Style.divider} />

                    <div className={Style.orderComment}>
                      <strong>Comment:</strong> {order.comment || "None"}
                    </div>
                  </div>

                  <div className={Style.orderFooter}>
                    <div className={Style.orderTotals}>
                      <strong>Subtotal:</strong> ${order.subtotal.toFixed(2)} <br />
                      <strong>Tax:</strong> ${order.tax.toFixed(2)} <br />
                      <strong>Total:</strong> ${order.total.toFixed(2)}
                    </div>

                    <div className={Style.orderActions}>
                      <button
                        onClick={() => handleCancel(order._id)}
                        className={`${Style.actionButton} ${Style.cancelButton}`}
                      >
                        <FaTimes /> Cancel
                      </button>

                      <button
                        onClick={() => handleFulfill(order._id)}
                        className={`${Style.actionButton} ${Style.fulfillButton}`}
                      >
                        <FaCheck /> Fulfill
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {showLeftArrow && (
            <button onClick={scrollLeft} className={`${Style.navButton} ${Style.leftArrow}`}>
              <FaArrowLeft size={20} />
            </button>
          )}

          {orders.length > 4 && (
            <button onClick={scrollRight} className={`${Style.navButton} ${Style.rightArrow}`}>
              <FaArrowRight size={20} />
            </button>
          )}
        </div>
      </div>

      <Modal
        contentClassName={MenuStyle.modalContent}
        centered
        show={confirmModalOpen}
        onHide={() => setConfirmModalOpen(false)}
      >
        <Modal.Header className={MenuStyle.modalHeader}>
          <Modal.Title>Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body className={MenuStyle.modalBody}>
          <p>{confirmMessage}</p>
        </Modal.Body>
        <Modal.Footer className={MenuStyle.modalFooter}>
          <Button variant="secondary" onClick={() => setConfirmModalOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              setConfirmModalOpen(false);
              confirmAction();
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}
