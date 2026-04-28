"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/app/context/ProfileContext";
import StoryViewerModal, { type StoryItem } from "@/app/components/StoryViewerModal";

export default function ProfilePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { profile, refreshProfile } = useProfile();

  const [myReels, setMyReels] = useState<any[]>([]);
  const [myStories, setMyStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"reels" | "stories">("reels");
  const [editUsername, setEditUsername] = useState("");
  const [usernameMsg, setUsernameMsg] = useState("");
  const [usernameError, setUsernameError] = useState("");

  // Story viewer
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated") loadMedia();
  }, [status]); // eslint-disable-line

  // Keep username field in sync when profile context updates
  useEffect(() => {
    if (profile?.username) setEditUsername(profile.username);
  }, [profile?.username]);

  const loadMedia = useCallback(async () => {
    setLoading(true);
    try {
      const userId = (session?.user as any)?.id as string;

      const [videosRes, storiesRes] = await Promise.all([
        fetch("/api/videos?page=1&query=all"),
        fetch("/api/stories"),
      ]);

      const videosData = await videosRes.json();
      const storiesData = await storiesRes.json();

      // Fix: compare as strings — MongoDB ObjectId vs session string
      if (Array.isArray(videosData)) {
        setMyReels(
          videosData.filter((v: any) => {
            const vid = v.userId?._id?.toString() || v.userId?.id?.toString() || v.userId?.toString();
            return !v.isPexels && vid === userId;
          })
        );
      }

      if (Array.isArray(storiesData)) {
        setMyStories(
          storiesData.filter((s: any) => {
            const sid = s.userId?._id?.toString() || s.userId?.id?.toString() || s.userId?.toString();
            return sid === userId;
          })
        );
      }
    } finally {
      setLoading(false);
    }
  }, [session]);

  const updateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setUsernameMsg(""); setUsernameError("");
    const res = await fetch("/api/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: editUsername }),
    });
    const data = await res.json();
    if (res.ok) {
      setUsernameMsg("Username updated!");
      await update({ username: data.username });
      await refreshProfile(); // sync sidebar immediately
    } else {
      setUsernameError(data.error || "Failed to update");
    }
  };

  const deleteReel = async (id: string) => {
    if (!confirm("Delete this reel?")) return;
    const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMyReels(prev => prev.filter(r => r._id !== id));
      await refreshProfile();
    }
  };

  const deleteStory = async (id: string) => {
    if (!confirm("Delete this story?")) return;
    const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
    if (res.ok) {
      setMyStories(prev => prev.filter(s => s._id !== id));
      await refreshProfile();
    }
  };

  if (loading || status === "loading") {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#F0E7D5" }}>
        <div style={{ width: 40, height: 40, border: "4px solid rgba(33,40,66,0.1)", borderTopColor: "#212842", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const username = profile?.username || session?.user?.name || "User";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#F0E7D5" }}>

      {/* Story Viewer Modal */}
      {viewerOpen && myStories.length > 0 && (
        <StoryViewerModal
          stories={myStories}
          startIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}

      {/* Top Bar */}
      <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 24px", borderBottom: "1px solid rgba(33,40,66,0.1)", background: "rgba(240,231,213,0.95)", flexShrink: 0 }}>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: "#212842" }}>Settings &amp; Profile</h1>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>

        {/* Profile Header */}
        <div style={{ display: "flex", gap: 24, alignItems: "center", marginBottom: 28 }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#212842", color: "#F0E7D5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, flexShrink: 0, boxShadow: "0 8px 24px rgba(33,40,66,0.2)" }}>
            {username[0].toUpperCase()}
          </div>
          <div>
            <p style={{ fontWeight: 900, fontSize: 20, color: "#212842", margin: 0 }}>@{username}</p>
            <p style={{ fontSize: 12, color: "rgba(33,40,66,0.4)", margin: "3px 0 0 0" }}>{session?.user?.email}</p>
            <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
              {[
                ["reelsCount", "Reels"],
                ["storiesCount", "Stories"],
                ["followersCount", "Followers"],
                ["followingCount", "Following"],
              ].map(([key, label]) => (
                <div key={key} style={{ textAlign: "center" }}>
                  <span style={{ display: "block", fontWeight: 800, fontSize: 16, color: "#212842" }}>
                    {profile?.[key as keyof typeof profile] ?? 0}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(33,40,66,0.45)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Change Username */}
        <div style={{ background: "rgba(255,255,255,0.5)", border: "1px solid rgba(33,40,66,0.08)", borderRadius: 16, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 800, fontSize: 14, color: "#212842", marginBottom: 14 }}>Change Username</h3>
          <form onSubmit={updateUsername} style={{ display: "flex", gap: 10 }}>
            <input
              value={editUsername}
              onChange={e => setEditUsername(e.target.value)}
              placeholder="new_username"
              style={{ flex: 1, padding: "10px 14px", background: "rgba(33,40,66,0.06)", border: "1px solid rgba(33,40,66,0.1)", borderRadius: 10, fontSize: 13, color: "#212842", outline: "none" }}
            />
            <button type="submit" style={{ padding: "10px 20px", background: "#212842", color: "#F0E7D5", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Save</button>
          </form>
          {usernameMsg && <p style={{ fontSize: 12, color: "#212842", marginTop: 8, fontWeight: 700 }}>✓ {usernameMsg}</p>}
          {usernameError && <p style={{ fontSize: 12, color: "rgba(33,40,66,0.6)", marginTop: 8, fontWeight: 700 }}>✗ {usernameError}</p>}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
          {(["reels", "stories"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: 13, textTransform: "capitalize",
                background: tab === t ? "#212842" : "rgba(33,40,66,0.08)",
                color: tab === t ? "#F0E7D5" : "rgba(33,40,66,0.5)",
              }}
            >
              {t} ({t === "reels" ? myReels.length : myStories.length})
            </button>
          ))}
        </div>

        {/* My Reels Grid */}
        {tab === "reels" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {myReels.length === 0 && <p style={{ gridColumn: "span 3", textAlign: "center", padding: "40px 0", color: "rgba(33,40,66,0.35)", fontSize: 14 }}>No reels yet</p>}
            {myReels.map((reel: any) => (
              <div
                key={reel._id}
                style={{ position: "relative", borderRadius: 13, overflow: "hidden", background: "linear-gradient(135deg, rgba(33,40,66,0.15), rgba(33,40,66,0.45))", aspectRatio: "9/16", cursor: "pointer" }}
                onClick={() => router.push(`/reels?id=${reel._id}`)}
              >
                {/* Thumbnail with fallback */}
                {reel.thumbnailUrl && !reel.thumbnailUrl.includes("placeholder") ? (
                  <img src={reel.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : reel.videoUrl && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(reel.videoUrl) ? (
                  <img src={reel.videoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <video src={reel.videoUrl} preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}

                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(33,40,66,0.85) 0%, transparent 50%)" }}>
                  <p style={{ position: "absolute", bottom: 32, left: 9, right: 9, fontSize: 11, color: "#F0E7D5", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reel.title}</p>
                  {/* Play icon */}
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteReel(reel._id); }}
                    style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", borderRadius: 8, padding: "4px 8px", color: "#F0E7D5", fontSize: 11, fontWeight: 700 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Stories Grid */}
        {tab === "stories" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {myStories.length === 0 && <p style={{ gridColumn: "span 3", textAlign: "center", padding: "40px 0", color: "rgba(33,40,66,0.35)", fontSize: 14 }}>No active stories</p>}
            {myStories.map((story, index) => (
              <div
                key={story._id}
                style={{ position: "relative", borderRadius: 13, overflow: "hidden", background: "rgba(33,40,66,0.15)", aspectRatio: "9/16", cursor: "pointer" }}
                onClick={() => { setViewerIndex(index); setViewerOpen(true); }}
              >
                {story.mediaUrl && (
                  story.mediaType === "video"
                    ? <video src={story.mediaUrl} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <img src={story.mediaUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(33,40,66,0.8) 0%, transparent 50%)" }}>
                  {story.caption && <p style={{ position: "absolute", bottom: 32, left: 9, right: 9, fontSize: 11, color: "#F0E7D5", fontWeight: 600 }}>{story.caption}</p>}
                  {/* Play/View hint */}
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteStory(story._id); }}
                    style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.5)", border: "none", cursor: "pointer", borderRadius: 8, padding: "4px 8px", color: "#F0E7D5", fontSize: 11, fontWeight: 700 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Logout */}
        <div style={{ marginTop: 32, paddingTop: 20, borderTop: "1px solid rgba(33,40,66,0.08)" }}>
          <button
            onClick={() => signOut()}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 20px", background: "none", border: "1px solid rgba(33,40,66,0.15)", borderRadius: 12, cursor: "pointer", color: "rgba(33,40,66,0.6)", fontWeight: 700, fontSize: 13 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
