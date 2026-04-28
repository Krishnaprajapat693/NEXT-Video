"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ReelsPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const queryRef = useRef("nature");
  const observer = useRef<IntersectionObserver | null>(null);
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id");
  const scrolledToRef = useRef(false);

  useEffect(() => {
    const QUERIES = ["nature", "lifestyle", "sports", "city", "ocean"];
    queryRef.current = QUERIES[Math.floor(Math.random() * QUERIES.length)];
    setLoading(true);
    fetch(`/api/videos?page=1&query=${queryRef.current}`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setVideos(d); })
      .finally(() => setLoading(false));
  }, []);

  // Scroll to target video when list is ready
  useEffect(() => {
    if (!targetId || scrolledToRef.current || videos.length === 0) return;
    const el = document.getElementById(`reel-${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      scrolledToRef.current = true;
    }
  }, [videos, targetId]);


  const lastRef = useCallback((node: any) => {
    if (loading || fetchingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) setPage(p => p + 1);
    }, { rootMargin: "200% 0px" });
    if (node) observer.current.observe(node);
  }, [loading, fetchingMore, hasMore]);

  useEffect(() => {
    if (page === 1) return;
    setFetchingMore(true);
    fetch(`/api/videos?page=${page}&query=${queryRef.current}`)
      .then(r => r.json())
      .then(d => {
        if (!Array.isArray(d) || d.length === 0) { setHasMore(false); return; }
        setVideos(prev => [...prev, ...d]);
      })
      .finally(() => setFetchingMore(false));
  }, [page]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", alignItems: "center", justifyContent: "center", background: "#F0E7D5" }}>
        <div style={{ width: 48, height: 48, border: "5px solid rgba(33,40,66,0.15)", borderTopColor: "#212842", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ marginTop: 16, color: "rgba(33,40,66,0.5)", fontSize: 13, fontWeight: 600 }}>Loading Reels...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", overflowY: "scroll", scrollSnapType: "y mandatory", background: "#212842" }}>
      {videos.map((video: any, i: number) => (
        <div
          key={`${video._id}-${i}`}
          id={`reel-${video._id}`}
          ref={i === videos.length - 1 ? lastRef : null}
          style={{ height: "100vh", scrollSnapAlign: "start", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
        >
          <ReelCard video={video} />
        </div>
      ))}
      {fetchingMore && (
        <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 40, height: 40, border: "4px solid rgba(240,231,213,0.2)", borderTopColor: "#F0E7D5", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      )}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } ::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}

// ─── Individual Reel Card ─────────────────────────────────────
function ReelCard({ video }: { video: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [liked, setLiked] = useState(!!video.isLiked);
  const [likesCount, setLikesCount] = useState(Number(video.likesCount) || 0);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [commentsCount, setCommentsCount] = useState(Number(video.commentsCount) || 0);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [likeError, setLikeError] = useState("");

  const username = video.userId?.username || video.userId?.name || "creator";
  const isPexels = video.isPexels || String(video._id).startsWith("pexels_");
  const isImage = video.videoUrl && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(video.videoUrl);

  // Auto-play on scroll into view
  useEffect(() => {
    if (isImage) return; // images don't play
    const obs = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
          setShowComments(false);
        }
      },
      { threshold: 0.6 }
    );
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [isImage]);

  const togglePlay = () => {
    if (isImage) return;
    if (isPlaying) { videoRef.current?.pause(); setIsPlaying(false); }
    else { videoRef.current?.play().catch(() => {}); setIsPlaying(true); }
  };

  const toggleLike = async () => {
    if (!session) {
      setLikeError("Log in to like");
      setTimeout(() => setLikeError(""), 2000);
      return;
    }
    if (isPexels) {
      setLikeError("Can't like external videos");
      setTimeout(() => setLikeError(""), 2000);
      return;
    }
    // Optimistic update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikesCount(c => newLiked ? c + 1 : Math.max(0, c - 1));

    try {
      const res = await fetch(`/api/videos/${video._id}/like`, { method: "POST" });
      if (!res.ok) {
        // Revert
        setLiked(!newLiked);
        setLikesCount(c => newLiked ? Math.max(0, c - 1) : c + 1);
        setLikeError("Like failed");
        setTimeout(() => setLikeError(""), 2000);
      } else {
        const data = await res.json();
        setLikesCount(data.likesCount ?? likesCount);
        setLiked(data.liked ?? newLiked);
      }
    } catch {
      setLiked(!newLiked);
      setLikesCount(c => newLiked ? Math.max(0, c - 1) : c + 1);
    }
  };

  const openComments = async () => {
    setShowComments(true);
    if (isPexels || comments.length > 0) return;
    setCommentsLoading(true);
    try {
      const res = await fetch(`/api/videos/${video._id}/comments`);
      const data = await res.json();
      if (Array.isArray(data)) setComments(data);
    } finally {
      setCommentsLoading(false);
    }
  };

  const submitComment = async () => {
    if (!session) {
      setCommentError("Log in to comment");
      setTimeout(() => setCommentError(""), 2500);
      return;
    }
    if (!commentText.trim()) return;
    if (isPexels) {
      setCommentError("Can't comment on external videos");
      setTimeout(() => setCommentError(""), 2500);
      return;
    }

    const text = commentText.trim();
    setCommentText("");
    setCommentError("");

    try {
      const res = await fetch(`/api/videos/${video._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => [newComment, ...prev]);
        setCommentsCount(c => c + 1);
      } else {
        setCommentText(text);
        const err = await res.json();
        setCommentError(err.error || "Failed to post comment");
        setTimeout(() => setCommentError(""), 2500);
      }
    } catch {
      setCommentText(text);
      setCommentError("Network error");
      setTimeout(() => setCommentError(""), 2500);
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: 420, height: "90vh", background: "#111827", borderRadius: 24, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>

      {/* Media — image or video */}
      {isImage ? (
        <img src={video.videoUrl} alt={video.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.thumbnailUrl}
          onClick={togglePlay}
          loop playsInline muted={isMuted}
          style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer" }}
        />
      )}

      {/* Play/Pause overlay for video */}
      {!isImage && !isPlaying && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }} onClick={togglePlay}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#F0E7D5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "16px 16px 40px", background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)", display: "flex", justifyContent: "flex-end" }}>
        {!isImage && (
          <button onClick={e => { e.stopPropagation(); setIsMuted(!isMuted); }} style={{ background: "rgba(255,255,255,0.1)", border: "none", borderRadius: 10, cursor: "pointer", padding: 10, color: "#F0E7D5" }}>
            {isMuted
              ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
              : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 5 6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            }
          </button>
        )}
      </div>

      {/* Like/Comment error toast */}
      {(likeError || commentError) && (
        <div style={{ position: "absolute", top: 70, left: "50%", transform: "translateX(-50%)", background: "rgba(33,40,66,0.9)", color: "#F0E7D5", padding: "8px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap", zIndex: 10 }}>
          {likeError || commentError}
        </div>
      )}

      {/* Right action buttons */}
      <div style={{ position: "absolute", right: 12, bottom: 120, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
        {/* Like */}
        <button onClick={toggleLike} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: liked ? "#F0E7D5" : "rgba(240,231,213,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill={liked ? "#212842" : "none"} stroke={liked ? "#212842" : "#F0E7D5"} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <span style={{ color: "#F0E7D5", fontSize: 11, fontWeight: 700 }}>{likesCount}</span>
        </button>

        {/* Comment */}
        <button onClick={openComments} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "rgba(240,231,213,0.15)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F0E7D5" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <span style={{ color: "#F0E7D5", fontSize: 11, fontWeight: 700 }}>{commentsCount}</span>
        </button>
      </div>

      {/* Bottom info */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "40px 16px 20px", background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div
            onClick={() => router.push(`/${username}`)}
            style={{ width: 36, height: 36, borderRadius: "50%", background: "#F0E7D5", border: "2px solid rgba(240,231,213,0.5)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: "#212842", flexShrink: 0, cursor: "pointer" }}
          >
            {username[0].toUpperCase()}
          </div>
          <span
            onClick={() => !isPexels && router.push(`/${username}`)}
            style={{ color: "#F0E7D5", fontWeight: 700, fontSize: 14, cursor: isPexels ? "default" : "pointer" }}
          >
            @{username}
          </span>
        </div>
        <p style={{ color: "rgba(240,231,213,0.8)", fontSize: 13, lineHeight: 1.4, margin: 0 }}>{video.description}</p>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", display: "flex", flexDirection: "column", justifyContent: "flex-end", zIndex: 20 }}
          onClick={() => setShowComments(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: "#F0E7D5", borderRadius: "20px 20px 0 0", padding: 20, maxHeight: "65vh", display: "flex", flexDirection: "column" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ fontWeight: 800, fontSize: 15, color: "#212842", margin: 0 }}>
                Comments {commentsCount > 0 && `(${commentsCount})`}
              </h3>
              <button onClick={() => setShowComments(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(33,40,66,0.5)", fontSize: 22, lineHeight: 1 }}>×</button>
            </div>

            {isPexels && (
              <p style={{ color: "rgba(33,40,66,0.4)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                Comments not available for external reels
              </p>
            )}

            {!isPexels && (
              <>
                <div style={{ flex: 1, overflowY: "auto", marginBottom: 12, display: "flex", flexDirection: "column", gap: 12 }}>
                  {commentsLoading && <p style={{ color: "rgba(33,40,66,0.4)", fontSize: 13, textAlign: "center" }}>Loading comments...</p>}
                  {!commentsLoading && comments.length === 0 && (
                    <p style={{ color: "rgba(33,40,66,0.35)", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
                      No comments yet. Be the first!
                    </p>
                  )}
                  {comments.map((c: any) => (
                    <div key={c._id} style={{ display: "flex", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#212842", color: "#F0E7D5", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                        {(c.userId?.username || "U")[0].toUpperCase()}
                      </div>
                      <div style={{ background: "rgba(33,40,66,0.06)", padding: "8px 12px", borderRadius: "0 12px 12px 12px", flex: 1 }}>
                        <span style={{ fontWeight: 700, fontSize: 12, color: "#212842" }}>@{c.userId?.username || "user"} </span>
                        <span style={{ fontSize: 13, color: "rgba(33,40,66,0.8)" }}>{c.text}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment input */}
                {!session && (
                  <div style={{ textAlign: "center", padding: "10px 0", color: "rgba(33,40,66,0.5)", fontSize: 13 }}>
                    <a href="/login" style={{ color: "#212842", fontWeight: 700 }}>Log in</a> to comment
                  </div>
                )}
                {session && (
                  <div style={{ display: "flex", gap: 8 }}>
                    <input
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && !e.shiftKey && submitComment()}
                      placeholder="Add a comment..."
                      style={{ flex: 1, padding: "10px 14px", background: "rgba(33,40,66,0.08)", border: "1px solid rgba(33,40,66,0.1)", borderRadius: 12, fontSize: 13, color: "#212842", outline: "none" }}
                    />
                    <button
                      onClick={submitComment}
                      disabled={!commentText.trim()}
                      style={{ padding: "10px 16px", background: commentText.trim() ? "#212842" : "rgba(33,40,66,0.3)", color: "#F0E7D5", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 13, cursor: commentText.trim() ? "pointer" : "not-allowed", transition: "background 0.2s" }}
                    >
                      Post
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
