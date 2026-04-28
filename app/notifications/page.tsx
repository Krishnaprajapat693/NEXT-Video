"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetch("/api/notifications")
      .then(r => r.json())
      .then(d => {
        if (d.notifications) { setNotifications(d.notifications); setUnreadCount(d.unreadCount || 0); }
      })
      .finally(() => setLoading(false));
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "PATCH" });
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getNotifText = (n: any) => {
    const sender = n.senderId?.username || "Someone";
    switch (n.type) {
      case "follow": return `@${sender} started following you`;
      case "new_reel": return `@${sender} uploaded a new reel`;
      case "new_story": return `@${sender} uploaded a new story`;
      case "like": return `@${sender} liked your reel`;
      case "comment": return `@${sender} commented on your reel`;
      default: return `New activity from @${sender}`;
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "follow": return "👤";
      case "new_reel": return "🎬";
      case "new_story": return "📸";
      case "like": return "❤️";
      case "comment": return "💬";
      default: return "🔔";
    }
  };

  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d ago`;
    if (h > 0) return `${h}h ago`;
    if (m > 0) return `${m}m ago`;
    return "Just now";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#F0E7D5" }}>
      {/* Top Bar */}
      <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid rgba(33,40,66,0.1)", background: "rgba(240,231,213,0.95)", flexShrink: 0 }}>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: "#212842" }}>
          Notifications {unreadCount > 0 && <span style={{ fontSize: 12, background: "#212842", color: "#F0E7D5", padding: "2px 8px", borderRadius: 99, marginLeft: 8 }}>{unreadCount}</span>}
        </h1>
        {unreadCount > 0 && (
          <button onClick={markAllRead} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(33,40,66,0.5)", fontSize: 12, fontWeight: 700 }}>
            Mark all read
          </button>
        )}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 24px 40px" }}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "14px 0", borderBottom: "1px solid rgba(33,40,66,0.06)" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(33,40,66,0.08)" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ height: 12, background: "rgba(33,40,66,0.08)", borderRadius: 6, width: "70%" }} />
                <div style={{ height: 10, background: "rgba(33,40,66,0.05)", borderRadius: 6, width: "30%" }} />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔔</div>
            <p style={{ color: "rgba(33,40,66,0.4)", fontSize: 15, fontWeight: 600 }}>No notifications yet</p>
            <p style={{ color: "rgba(33,40,66,0.3)", fontSize: 13, marginTop: 6 }}>Follow people and upload reels to get started</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {notifications.map((n: any) => (
              <div
                key={n._id}
                style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 12px",
                  borderRadius: 12, background: n.isRead ? "transparent" : "rgba(33,40,66,0.05)",
                  transition: "background 0.2s",
                }}
              >
                {/* Avatar with type icon */}
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#212842", color: "#F0E7D5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16 }}>
                    {(n.senderId?.username || "U")[0].toUpperCase()}
                  </div>
                  <div style={{ position: "absolute", bottom: -2, right: -2, fontSize: 14, lineHeight: 1 }}>
                    {getNotifIcon(n.type)}
                  </div>
                </div>
                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: "#212842", fontWeight: n.isRead ? 500 : 700, margin: 0, lineHeight: 1.4 }}>
                    {getNotifText(n)}
                  </p>
                  <p style={{ fontSize: 11, color: "rgba(33,40,66,0.4)", margin: "3px 0 0 0", fontWeight: 500 }}>
                    {timeAgo(n.createdAt)}
                  </p>
                </div>
                {/* Unread dot */}
                {!n.isRead && (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#212842", flexShrink: 0 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
