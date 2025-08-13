import { apiFetch } from "@/lib/api";
import { useEffect } from "react";
import styles from "./notificationPopSmall.module.css";

export default function NotificationPopSmall({
  from,
  message,
  seen,
  timestamp,
  type,
  notificationId,
}) {
  const formatTime = new Date(timestamp).toLocaleDateString();

  let typeBadge;
  if (type == "user-activated") {
    typeBadge = (
      <div className={styles.badgeWrapper}>
        <span className={`${styles.badge} ${styles.badgeSuccess}`}>
          <svg className={styles.badgeIcon} viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
          </svg>
          {type}
        </span>
      </div>
    );
  } else if (type == "low-stock") {
    typeBadge = (
      <div className={styles.badgeWrapper}>
        <span className={`${styles.badge} ${styles.badgeWarning}`}>
          <svg className={styles.badgeIcon} viewBox="0 0 16 16" fill="currentColor">
            <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
          </svg>
          {type}
        </span>
      </div>
    );
  } else {
    typeBadge = (
      <div className={styles.badgeWrapper}>
        <span className={`${styles.badge} ${styles.badgeSecondary}`}>
          <svg className={styles.badgeIcon} viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" />
          </svg>
          {type}
        </span>
      </div>
    );
  }

  useEffect(() => {
    if (!seen) {
      notificationSeen(notificationId);
    }
  }, [notificationId, seen]);

  const notificationSeen = async (notificationId) => {
    try {
      const res = await apiFetch(`/notification/${notificationId}`, {
        method: "PUT",
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className={`${styles.notificationItem} ${!seen ? styles.notificationItemUnread : ""}`}>
      <div className={styles.notificationHeader}>
        <div className={styles.notificationFrom}>
          {from}
          {seen && <span className={styles.seenIcon}>👁</span>}
        </div>
        <small className={styles.notificationTime}>{formatTime}</small>
      </div>

      <div className={styles.notificationMessage}>{message}</div>

      {type && typeBadge}
    </div>
  );
}
