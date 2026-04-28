"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import StoryViewerModal, { type StoryItem } from "@/app/components/StoryViewerModal";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [stories, setStories] = useState<StoryItem[]>([]);
  const [feed, setFeed] = useState<any[]>([]);
  const [storiesLoading, setStoriesLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(true);

  // Story viewer state
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  // Fetch stories only when logged in
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") { setStoriesLoading(false); return; }
    fetch("/api/stories")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setStories(d); })
      .catch(() => {})
      .finally(() => setStoriesLoading(false));
  }, [status]);

  // Fetch feed (public)
  useEffect(() => {
    fetch("/api/videos?page=1&query=lifestyle")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setFeed(d.slice(0, 9)); })
      .catch(() => {})
      .finally(() => setFeedLoading(false));
  }, []);

  const openStory = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#F0E7D5" }}>

      {/* Story Viewer Modal */}
      {viewerOpen && stories.length > 0 && (
        <StoryViewerModal
          stories={stories}
          startIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}

      {/* ── Top Bar ── */}
      <div style={{ height: 60, display: "flex", alignItems: "center", padding: "0 24px", gap: 12, borderBottom: "1px solid rgba(33,40,66,0.1)", background: "rgba(240,231,213,0.95)", backdropFilter: "blur(12px)", flexShrink: 0 }}>
        {/* Search */}
        <div
          style={{ position: "relative", flex: 1, maxWidth: 280, cursor: "pointer" }}
          onClick={() => router.push("/search")}
        >
          <svg style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(33,40,66,0.4)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            readOnly
            placeholder="Search users..."
            style={{ width: "100%", padding: "8px 16px 8px 34px", background: "rgba(33,40,66,0.07)", border: "1px solid rgba(33,40,66,0.1)", borderRadius: 10, fontSize: 13, color: "#212842", outline: "none", cursor: "pointer", pointerEvents: "none" }}
          />
        </div>

        <div style={{ flex: 1 }} />

        {/* Bell */}
        <Link href="/notifications" style={{ background: "none", border: "none", cursor: "pointer", padding: 8, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(33,40,66,0.55)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </Link>

        {/* Add photo / post */}
        <Link
          href="/upload"
          style={{ display: "flex", alignItems: "center", gap: 6, background: "#212842", color: "#F0E7D5", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add photo
        </Link>
      </div>

      {/* ── Scrollable Content ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 40px" }}>

        {/* ── Stories ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#212842" }}>Stories</h2>
            <Link href="/upload?type=story" style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, color: "rgba(33,40,66,0.45)", textDecoration: "none" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="rgba(33,40,66,0.45)"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              Watch all
            </Link>
          </div>

          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 6 }}>
            {/* Add Story button */}
            <Link href="/upload?type=story" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0, textDecoration: "none" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", border: "2px dashed rgba(33,40,66,0.22)", background: "rgba(33,40,66,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(33,40,66,0.35)" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <span style={{ fontSize: 10, color: "rgba(33,40,66,0.5)", fontWeight: 500 }}>Add Story</span>
            </Link>

            {/* Stories loading skeleton */}
            {storiesLoading && Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(33,40,66,0.08)" }} />
                <div style={{ width: 36, height: 8, background: "rgba(33,40,66,0.06)", borderRadius: 4 }} />
              </div>
            ))}

            {/* Not logged in */}
            {!storiesLoading && status === "unauthenticated" && (
              <div style={{ display: "flex", alignItems: "center", fontSize: 12, color: "rgba(33,40,66,0.35)", fontStyle: "italic", padding: "0 8px" }}>
                <Link href="/login" style={{ color: "#212842", fontWeight: 700, textDecoration: "none" }}>Log in</Link>&nbsp;to see stories
              </div>
            )}

            {/* Empty state */}
            {!storiesLoading && status === "authenticated" && stories.length === 0 && (
              <div style={{ display: "flex", alignItems: "center", fontSize: 12, color: "rgba(33,40,66,0.35)", fontStyle: "italic", padding: "0 8px" }}>
                Follow people to see their stories here
              </div>
            )}

            {/* Stories — clickable */}
            {!storiesLoading && stories.map((story, index) => {
              const uname = story.userId?.username || story.userId?.email?.split("@")[0] || "user";
              return (
                <button
                  key={story._id}
                  onClick={() => openStory(index)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    gap: 5, flexShrink: 0, cursor: "pointer",
                    background: "none", border: "none", padding: 0,
                  }}
                >
                  {/* Ring */}
                  <div style={{ padding: 2, borderRadius: "50%", background: "linear-gradient(135deg, #212842 0%, rgba(33,40,66,0.5) 100%)" }}>
                    <div style={{ padding: 2, borderRadius: "50%", background: "#F0E7D5" }}>
                      {story.mediaType === "image" && story.mediaUrl ? (
                        <img src={story.mediaUrl} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }} />
                      ) : story.mediaType === "video" && story.mediaUrl ? (
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#212842", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="#F0E7D5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                      ) : (
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#212842", color: "#F0E7D5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700 }}>
                          {uname[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: 10, color: "rgba(33,40,66,0.6)", fontWeight: 500, maxWidth: 52, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{uname}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Feed ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#212842" }}>Feed</h2>
            <div style={{ display: "flex", gap: 4 }}>
              <button style={{ padding: "5px 12px", borderRadius: 8, background: "rgba(33,40,66,0.08)", border: "none", fontSize: 12, fontWeight: 600, color: "#212842", cursor: "pointer" }}>Latest</button>
              <Link href="/reels" style={{ padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 500, color: "rgba(33,40,66,0.45)", textDecoration: "none", display: "flex", alignItems: "center" }}>Popular</Link>
            </div>
          </div>

          {/* Feed loading skeleton */}
          {feedLoading && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ borderRadius: 14, background: "rgba(33,40,66,0.08)", height: i % 3 === 0 ? 320 : 155 }} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!feedLoading && feed.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
              <p style={{ color: "rgba(33,40,66,0.4)", fontSize: 15, fontWeight: 600, margin: 0 }}>No posts yet</p>
              <Link href="/upload" style={{ display: "inline-block", marginTop: 14, padding: "10px 24px", background: "#212842", color: "#F0E7D5", borderRadius: 10, textDecoration: "none", fontWeight: 700, fontSize: 13 }}>
                Upload your first post
              </Link>
            </div>
          )}

          {/* Feed grid */}
          {!feedLoading && feed.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridAutoRows: "auto", gap: 12 }}>
              {feed.map((video: any, i: number) => {
                const isTall = i % 3 === 0;
                const username = video.userId?.username || video.userId?.name || "creator";
                const isImage = video.videoUrl && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(video.videoUrl);

                return (
                  <Link
                    key={video._id}
                    href={`/reels?id=${video._id}`}
                    style={{
                      gridRow: isTall ? "span 2" : "span 1",
                      borderRadius: 14, overflow: "hidden",
                      background: "rgba(33,40,66,0.12)",
                      minHeight: isTall ? 320 : 155,
                      cursor: "pointer", position: "relative",
                      border: "1px solid rgba(33,40,66,0.08)",
                      textDecoration: "none", display: "block",
                    }}
                  >
                    {isImage ? (
                      <img src={video.videoUrl} alt={video.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                    ) : video.thumbnailUrl && !video.thumbnailUrl.includes("placeholder") && !video.thumbnailUrl.includes("thumb_default") ? (
                      <img src={video.thumbnailUrl} alt={video.title} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                    ) : (
                      <video src={video.videoUrl} preload="metadata" style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
                    )}

                    {/* Overlay */}
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 10, background: "linear-gradient(to top, rgba(33,40,66,0.85) 0%, transparent 100%)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(240,231,213,0.25)", border: "1px solid rgba(240,231,213,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#F0E7D5", flexShrink: 0 }}>
                          {username[0].toUpperCase()}
                        </div>
                        <span style={{ color: "#F0E7D5", fontSize: 10, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{username}</span>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 2, color: "rgba(240,231,213,0.85)", fontSize: 10 }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                          {video.likesCount || 0}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 2, color: "rgba(240,231,213,0.85)", fontSize: 10 }}>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                          {video.commentsCount || 0}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
