"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProfile } from "@/app/context/ProfileContext";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const username = params?.username as string;
  const { refreshProfile } = useProfile();

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (!username) return;
    fetch(`/api/users/${username}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { router.push("/search"); return; }
        setProfile(d);
        setIsFollowing(d.isFollowing);
      })
      .finally(() => setLoading(false));
  }, [username]); // eslint-disable-line

  const toggleFollow = async () => {
    if (!profile?.id) return;
    setFollowLoading(true);

    const prev = isFollowing;
    // Optimistic UI update
    setIsFollowing(!prev);
    setProfile((p: any) => ({ ...p, followersCount: p.followersCount + (prev ? -1 : 1) }));

    const res = await fetch(`/api/users/${profile.id}/follow`, { method: "POST" });
    if (!res.ok) {
      // Roll back on error
      setIsFollowing(prev);
      setProfile((p: any) => ({ ...p, followersCount: p.followersCount + (prev ? 1 : -1) }));
    } else {
      // Sync logged-in user's followingCount in sidebar
      await refreshProfile();
    }

    setFollowLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#F0E7D5" }}>
        <div style={{ width: 40, height: 40, border: "4px solid rgba(33,40,66,0.1)", borderTopColor: "#212842", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#F0E7D5" }}>
      {/* Top Bar */}
      <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 24px", gap: 12, borderBottom: "1px solid rgba(33,40,66,0.1)", background: "rgba(240,231,213,0.95)", flexShrink: 0 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(33,40,66,0.6)", display: "flex", alignItems: "center", gap: 4, fontWeight: 600, fontSize: 13 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </button>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: "#212842" }}>@{profile.username}</h1>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {/* Profile Card */}
        <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 28, background: "rgba(255,255,255,0.5)", border: "1px solid rgba(33,40,66,0.08)", borderRadius: 18, padding: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#212842", color: "#F0E7D5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, flexShrink: 0 }}>
            {(profile.username || "U")[0].toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 900, fontSize: 18, color: "#212842", margin: 0 }}>@{profile.username}</p>
            <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
              {[["reelsCount", "Reels"], ["followersCount", "Followers"], ["followingCount", "Following"]].map(([key, label]) => (
                <div key={key} style={{ textAlign: "center" }}>
                  <span style={{ display: "block", fontWeight: 800, fontSize: 16, color: "#212842" }}>{profile[key] || 0}</span>
                  <span style={{ fontSize: 11, color: "rgba(33,40,66,0.45)" }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={toggleFollow}
            disabled={followLoading}
            style={{
              padding: "10px 22px", borderRadius: 12, fontWeight: 700, fontSize: 13,
              cursor: followLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              background: isFollowing ? "transparent" : "#212842",
              color: isFollowing ? "#212842" : "#F0E7D5",
              border: isFollowing ? "2px solid rgba(33,40,66,0.2)" : "2px solid #212842",
              opacity: followLoading ? 0.6 : 1,
            }}
          >
            {followLoading ? "..." : isFollowing ? "Following" : "Follow"}
          </button>
        </div>

        {/* Reels Grid */}
        <h2 style={{ fontWeight: 800, fontSize: 14, color: "#212842", marginBottom: 14 }}>Reels</h2>
        {profile.reels?.length === 0 ? (
          <p style={{ textAlign: "center", padding: "40px 0", color: "rgba(33,40,66,0.35)", fontSize: 14 }}>No reels yet</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {profile.reels?.map((reel: any) => (
              <div
                key={reel._id}
                onClick={() => router.push(`/reels?id=${reel._id}`)}
                style={{ position: "relative", display: "block", borderRadius: 13, overflow: "hidden", background: "linear-gradient(135deg, rgba(33,40,66,0.15), rgba(33,40,66,0.45))", aspectRatio: "9/16", textDecoration: "none", cursor: "pointer" }}
              >
                {reel.thumbnailUrl && !reel.thumbnailUrl.includes("placeholder") ? (
                  <img src={reel.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : reel.videoUrl && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(reel.videoUrl) ? (
                  <img src={reel.videoUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : reel.videoUrl ? (
                  <video src={reel.videoUrl} preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : null}
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(33,40,66,0.7) 0%, transparent 60%)" }}>
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
                  <p style={{ position: "absolute", bottom: 8, left: 9, right: 9, fontSize: 11, color: "#F0E7D5", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{reel.title}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
