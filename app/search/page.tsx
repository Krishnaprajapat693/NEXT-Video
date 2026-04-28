"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});
  const [followersMap, setFollowersMap] = useState<Record<string, number>>({});
  const [followLoading, setFollowLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim().length > 0) search();
      else setResults([]);
    }, 350);
    return () => clearTimeout(t);
  }, [query]);

  const search = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setResults(data);
        const fMap: Record<string, boolean> = {};
        const cMap: Record<string, number> = {};
        data.forEach((u: any) => {
          fMap[u.id] = u.isFollowing;
          cMap[u.id] = u.followersCount;
        });
        setFollowingMap(fMap);
        setFollowersMap(cMap);
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFollow = async (e: React.MouseEvent, userId: string) => {
    e.stopPropagation(); // Don't navigate to profile
    const prev = followingMap[userId];
    setFollowLoading(m => ({ ...m, [userId]: true }));
    // Optimistic update
    setFollowingMap(m => ({ ...m, [userId]: !prev }));
    setFollowersMap(m => ({ ...m, [userId]: m[userId] + (prev ? -1 : 1) }));

    try {
      const res = await fetch(`/api/users/${userId}/follow`, { method: "POST" });
      if (!res.ok) {
        // Revert on failure
        setFollowingMap(m => ({ ...m, [userId]: prev }));
        setFollowersMap(m => ({ ...m, [userId]: m[userId] + (prev ? 1 : -1) }));
      }
    } catch {
      setFollowingMap(m => ({ ...m, [userId]: prev }));
    } finally {
      setFollowLoading(m => ({ ...m, [userId]: false }));
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#F0E7D5" }}>
      {/* Top Bar */}
      <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 24px", gap: 12, borderBottom: "1px solid rgba(33,40,66,0.1)", background: "rgba(240,231,213,0.95)", flexShrink: 0 }}>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: "#212842" }}>Discover</h1>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 40px" }}>
        {/* Search Input */}
        <div style={{ position: "relative", marginBottom: 24 }}>
          <svg style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(33,40,66,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by username..."
            autoFocus
            style={{ width: "100%", padding: "12px 40px 12px 42px", background: "rgba(33,40,66,0.07)", border: "1px solid rgba(33,40,66,0.1)", borderRadius: 14, fontSize: 14, color: "#212842", outline: "none", fontWeight: 500 }}
          />
          {loading && (
            <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, border: "2px solid rgba(33,40,66,0.15)", borderTopColor: "#212842", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          )}
        </div>

        {/* Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {results.length === 0 && query.trim() !== "" && !loading && (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p style={{ color: "rgba(33,40,66,0.4)", fontSize: 14, fontWeight: 600 }}>No users found for &quot;{query}&quot;</p>
            </div>
          )}

          {results.length === 0 && query.trim() === "" && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
              <p style={{ color: "rgba(33,40,66,0.4)", fontSize: 15, fontWeight: 600 }}>Search for people</p>
              <p style={{ color: "rgba(33,40,66,0.3)", fontSize: 13, marginTop: 6 }}>Find users by their username</p>
            </div>
          )}

          {results.map((user: any) => (
            <div
              key={user.id}
              onClick={() => router.push(`/${user.username}`)}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "rgba(255,255,255,0.55)", border: "1px solid rgba(33,40,66,0.08)", borderRadius: 16, cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.85)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.55)")}
            >
              {/* Avatar */}
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#212842", color: "#F0E7D5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 18, flexShrink: 0 }}>
                {(user.username || "U")[0].toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 800, fontSize: 14, color: "#212842", margin: 0 }}>@{user.username}</p>
                <div style={{ display: "flex", gap: 14, marginTop: 3 }}>
                  <span style={{ fontSize: 12, color: "rgba(33,40,66,0.45)", fontWeight: 600 }}>
                    {followersMap[user.id] ?? user.followersCount} followers
                  </span>
                  <span style={{ fontSize: 12, color: "rgba(33,40,66,0.45)", fontWeight: 600 }}>
                    {user.reelsCount} reels
                  </span>
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={e => toggleFollow(e, user.id)}
                disabled={followLoading[user.id]}
                style={{
                  padding: "8px 18px", borderRadius: 10, fontWeight: 700, fontSize: 12, cursor: "pointer",
                  transition: "all 0.2s",
                  background: followingMap[user.id] ? "transparent" : "#212842",
                  color: followingMap[user.id] ? "#212842" : "#F0E7D5",
                  border: followingMap[user.id] ? "2px solid rgba(33,40,66,0.2)" : "2px solid #212842",
                  opacity: followLoading[user.id] ? 0.6 : 1,
                  flexShrink: 0,
                }}
              >
                {followLoading[user.id] ? "..." : followingMap[user.id] ? "Following" : "Follow"}
              </button>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
