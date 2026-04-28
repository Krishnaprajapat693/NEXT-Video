"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

export default function UploadPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultType = searchParams?.get("type") === "story" ? "story" : "reel";

  const [uploadType, setUploadType] = useState<"reel" | "story">(defaultType);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login?callbackUrl=/upload");
  }, [status]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    setFile(f);
    setError("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) { setError("Please select a file"); return; }
    if (uploadType === "reel" && !title.trim()) { setError("Title is required for reels"); return; }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    if (uploadType === "reel") {
      formData.append("title", title);
      formData.append("description", description);
    } else {
      formData.append("caption", caption);
    }

    const endpoint = uploadType === "reel" ? "/api/upload" : "/api/stories";
    try {
      const res = await fetch(endpoint, { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok) {
        router.push(uploadType === "reel" ? "/" : "/");
      } else {
        setError(data.error || "Upload failed. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isVideoFile = file?.type.startsWith("video/");
  const acceptAttr = uploadType === "reel" ? "video/*,image/*" : "image/*,video/*";

  if (status === "loading") {
    return (
      <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F0E7D5" }}>
        <div style={{ width: 40, height: 40, border: "4px solid rgba(33,40,66,0.1)", borderTopColor: "#212842", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#F0E7D5" }}>
      {/* Top Bar */}
      <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid rgba(33,40,66,0.1)", background: "rgba(240,231,213,0.95)", flexShrink: 0 }}>
        <h1 style={{ fontSize: 16, fontWeight: 800, color: "#212842" }}>Create</h1>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(33,40,66,0.5)", fontWeight: 600, fontSize: 13 }}>Cancel</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px 24px 48px" }}>

        {/* Type Toggle */}
        <div style={{ display: "flex", gap: 6, marginBottom: 24, background: "rgba(33,40,66,0.07)", borderRadius: 14, padding: 4 }}>
          {(["reel", "story"] as const).map(t => (
            <button
              key={t}
              onClick={() => { setUploadType(t); setFile(null); setPreview(null); setError(""); }}
              style={{ flex: 1, padding: "10px", borderRadius: 10, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13, background: uploadType === t ? "#212842" : "transparent", color: uploadType === t ? "#F0E7D5" : "rgba(33,40,66,0.5)", textTransform: "capitalize", transition: "all 0.2s" }}
            >
              {t === "reel" ? "🎬 Reel" : "📸 Story"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* File Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            style={{ position: "relative", width: "100%", height: 240, borderRadius: 18, border: `2px dashed ${file ? "rgba(33,40,66,0.4)" : "rgba(33,40,66,0.2)"}`, background: file ? "rgba(33,40,66,0.04)" : "rgba(33,40,66,0.03)", overflow: "hidden", transition: "all 0.2s" }}
          >
            <input
              type="file"
              accept={acceptAttr}
              onChange={handleFile}
              style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", zIndex: 10, width: "100%", height: "100%" }}
            />
            {preview ? (
              isVideoFile
                ? <video src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted controls={false} />
                : <img src={preview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10 }}>
                <div style={{ fontSize: 44 }}>{uploadType === "reel" ? "🎬" : "📸"}</div>
                <p style={{ fontWeight: 700, fontSize: 14, color: "#212842", margin: 0 }}>
                  {uploadType === "reel" ? "Drop a video or photo here" : "Drop a photo or video here"}
                </p>
                <p style={{ fontSize: 12, color: "rgba(33,40,66,0.4)", margin: 0 }}>
                  {uploadType === "reel" ? "MP4, MOV, WebM, JPG, PNG" : "JPG, PNG, MP4, MOV"}
                </p>
                <div style={{ padding: "8px 20px", background: "#212842", color: "#F0E7D5", borderRadius: 10, fontSize: 12, fontWeight: 700, marginTop: 4 }}>
                  Browse files
                </div>
              </div>
            )}
            {/* File name badge */}
            {file && (
              <div style={{ position: "absolute", top: 10, right: 10, background: "rgba(33,40,66,0.8)", color: "#F0E7D5", padding: "4px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {file.name}
              </div>
            )}
          </div>

          {/* Reel fields */}
          {uploadType === "reel" && (
            <>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(33,40,66,0.45)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.08em" }}>Title *</label>
                <input
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Give your post a title..."
                  style={{ width: "100%", padding: "12px 14px", background: "rgba(33,40,66,0.06)", border: "1px solid rgba(33,40,66,0.1)", borderRadius: 12, fontSize: 14, color: "#212842", outline: "none" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(33,40,66,0.45)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.08em" }}>Caption / Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What's this about? Add hashtags..."
                  style={{ width: "100%", padding: "12px 14px", background: "rgba(33,40,66,0.06)", border: "1px solid rgba(33,40,66,0.1)", borderRadius: 12, fontSize: 14, color: "#212842", outline: "none", resize: "none" }}
                />
              </div>
            </>
          )}

          {/* Story caption */}
          {uploadType === "story" && (
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "rgba(33,40,66,0.45)", marginBottom: 7, textTransform: "uppercase", letterSpacing: "0.08em" }}>Caption (optional)</label>
              <input
                value={caption}
                onChange={e => setCaption(e.target.value)}
                placeholder="Add a caption to your story..."
                style={{ width: "100%", padding: "12px 14px", background: "rgba(33,40,66,0.06)", border: "1px solid rgba(33,40,66,0.1)", borderRadius: 12, fontSize: 14, color: "#212842", outline: "none" }}
              />
            </div>
          )}

          {/* Story info */}
          {uploadType === "story" && (
            <div style={{ display: "flex", gap: 10, padding: "10px 14px", background: "rgba(33,40,66,0.05)", borderRadius: 10 }}>
              <span style={{ fontSize: 16 }}>⏱</span>
              <p style={{ fontSize: 12, color: "rgba(33,40,66,0.5)", margin: 0, lineHeight: 1.5 }}>
                Stories are visible for <strong>24 hours</strong> to your followers, then auto-deleted.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ padding: "12px 16px", background: "rgba(33,40,66,0.08)", borderRadius: 12, fontSize: 13, color: "#212842", fontWeight: 600, display: "flex", gap: 8 }}>
              <span>⚠</span> {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !file || (uploadType === "reel" && !title.trim())}
            style={{
              width: "100%", padding: "15px",
              background: loading || !file || (uploadType === "reel" && !title.trim()) ? "rgba(33,40,66,0.25)" : "#212842",
              color: "#F0E7D5", border: "none", borderRadius: 14, fontWeight: 800, fontSize: 15,
              cursor: loading || !file || (uploadType === "reel" && !title.trim()) ? "not-allowed" : "pointer",
              transition: "all 0.2s",
            }}
          >
            {loading
              ? "Uploading..."
              : uploadType === "reel"
                ? "📤 Publish to Feed"
                : "📸 Share Story"
            }
          </button>
        </form>
      </div>
    </div>
  );
}
