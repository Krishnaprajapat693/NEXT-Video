"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

export interface StoryItem {
  _id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  caption?: string;
  userId?: { username?: string; email?: string } | null;
  expiresAt?: string;
}

interface StoryViewerModalProps {
  stories: StoryItem[];
  startIndex?: number;
  onClose: () => void;
}

const IMAGE_DURATION = 5000; // ms

export default function StoryViewerModal({
  stories,
  startIndex = 0,
  onClose,
}: StoryViewerModalProps) {
  const [current, setCurrent] = useState(startIndex);
  const [progress, setProgress] = useState(0); // 0-100
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const durationRef = useRef<number>(IMAGE_DURATION);
  const animRef = useRef<number | null>(null);

  const story = stories[current];

  // ── progress animation ──────────────────────────────────────────────────
  const startProgress = useCallback((duration: number) => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    durationRef.current = duration;
    startTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / durationRef.current) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        animRef.current = requestAnimationFrame(tick);
      } else {
        goNext();
      }
    };
    animRef.current = requestAnimationFrame(tick);
  }, [current]); // eslint-disable-line

  const stopProgress = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
  };

  // ── navigation ───────────────────────────────────────────────────────────
  const goNext = useCallback(() => {
    stopProgress();
    setCurrent((c) => {
      if (c + 1 >= stories.length) { onClose(); return c; }
      return c + 1;
    });
  }, [stories.length, onClose]);

  const goPrev = useCallback(() => {
    stopProgress();
    setCurrent((c) => Math.max(0, c - 1));
  }, []);

  // ── keyboard ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, goNext, goPrev]);

  // ── start timer when story changes ───────────────────────────────────────
  useEffect(() => {
    setProgress(0);
    stopProgress();

    if (!story) return;

    if (story.mediaType === "video") {
      // video duration determined after metadata loads — handled in onLoadedMetadata
      // fallback 10s if video doesn't load
      startProgress(10000);
    } else {
      startProgress(IMAGE_DURATION);
    }

    return () => stopProgress();
  }, [current]); // eslint-disable-line

  // ── prevent body scroll ──────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!story) return null;

  const username = story.userId?.username || story.userId?.email?.split("@")[0] || "user";

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.97)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
      onClick={onClose}
    >
      {/* ── Story card ── */}
      <div
        style={{
          position: "relative",
          width: "min(420px, 100vw)",
          height: "min(748px, 100dvh)",
          borderRadius: 18,
          overflow: "hidden",
          background: "#111",
          boxShadow: "0 32px 80px rgba(0,0,0,0.8)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Progress bars ── */}
        <div
          style={{
            position: "absolute", top: 10, left: 10, right: 10,
            display: "flex", gap: 4, zIndex: 10,
          }}
        >
          {stories.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1, height: 3, borderRadius: 99,
                background: "rgba(255,255,255,0.28)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 99,
                  background: "#fff",
                  width: i < current ? "100%" : i === current ? `${progress}%` : "0%",
                  transition: i === current ? "none" : undefined,
                }}
              />
            </div>
          ))}
        </div>

        {/* ── Header ── */}
        <div
          style={{
            position: "absolute", top: 22, left: 10, right: 10,
            display: "flex", alignItems: "center", gap: 10, zIndex: 10,
            paddingTop: 6,
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(240,231,213,0.2)",
              border: "2px solid rgba(255,255,255,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 900, color: "#fff", flexShrink: 0,
            }}
          >
            {username[0].toUpperCase()}
          </div>
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: "#fff" }}>
              @{username}
            </p>
            {story.expiresAt && (
              <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
                {getTimeLeft(story.expiresAt)}
              </p>
            )}
          </div>
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto", background: "none", border: "none",
              cursor: "pointer", color: "#fff", padding: 6, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Media ── */}
        {story.mediaType === "video" ? (
          <video
            ref={videoRef}
            key={story._id}
            src={story.mediaUrl}
            autoPlay
            playsInline
            muted={false}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onLoadedMetadata={(e) => {
              const dur = (e.currentTarget.duration || 10) * 1000;
              stopProgress();
              startProgress(dur);
            }}
            onEnded={goNext}
          />
        ) : (
          <img
            key={story._id}
            src={story.mediaUrl}
            alt={story.caption || "story"}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        {/* ── Gradient overlay ── */}
        <div
          style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 30%, transparent 65%, rgba(0,0,0,0.6) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* ── Caption ── */}
        {story.caption && (
          <div
            style={{
              position: "absolute", bottom: 28, left: 16, right: 16, zIndex: 5,
            }}
          >
            <p style={{ margin: 0, color: "#fff", fontSize: 14, fontWeight: 600, textShadow: "0 1px 4px rgba(0,0,0,0.6)", lineHeight: 1.4 }}>
              {story.caption}
            </p>
          </div>
        )}

        {/* ── Tap zones (prev / next) ── */}
        <button
          onClick={goPrev}
          aria-label="Previous story"
          style={{
            position: "absolute", left: 0, top: 0, bottom: 0, width: "35%",
            background: "transparent", border: "none", cursor: "pointer", zIndex: 6,
          }}
        />
        <button
          onClick={goNext}
          aria-label="Next story"
          style={{
            position: "absolute", right: 0, top: 0, bottom: 0, width: "35%",
            background: "transparent", border: "none", cursor: "pointer", zIndex: 6,
          }}
        />
      </div>

      {/* ── Arrow nav (large screens) ── */}
      {current > 0 && (
        <button
          onClick={goPrev}
          style={{
            position: "absolute", left: "max(24px, calc(50% - 260px))",
            top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer",
            color: "#fff", borderRadius: "50%", width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
      )}
      {current < stories.length - 1 && (
        <button
          onClick={goNext}
          style={{
            position: "absolute", right: "max(24px, calc(50% - 260px))",
            top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.12)", border: "none", cursor: "pointer",
            color: "#fff", borderRadius: "50%", width: 44, height: 44,
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}
    </div>
  );
}

function getTimeLeft(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m left` : `${m}m left`;
}
