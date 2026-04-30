"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';

interface ReelPlayerProps {
  video: {
    _id: string;
    videoUrl: string;
    thumbnailUrl: string;
    title: string;
    description: string;
    userId: {
      _id: string;
      username: string;
      profileImage?: string;
    };
  };
}

export default function ReelPlayer({ video }: ReelPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(() => {});
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.7 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-[440px] h-[85vh] bg-[#212842] rounded-[3rem] overflow-hidden group animate-fade-in shadow-[0_40px_100px_-20px_rgba(33,40,66,0.3)] border-4 border-[#212842]">
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={
          video.thumbnailUrl?.includes("placeholder") || video.thumbnailUrl?.includes("thumb_default")
            ? undefined
            : video.thumbnailUrl
        }
        className="w-full h-full object-cover cursor-pointer"
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300">
          <div className="p-8 rounded-full bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl">
            <svg className="w-16 h-16 text-white fill-white drop-shadow-2xl" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className="absolute top-0 left-0 right-0 p-10 flex justify-between items-start bg-gradient-to-b from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
          className="p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white shadow-2xl"
        >
          {isMuted ? (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
          ) : (
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
          )}
        </button>
      </div>

      {/* Right Sidebar Actions - Clearly Spaced, Light Theme Glass */}
      <div className="absolute right-6 bottom-40 flex flex-col items-center space-y-10 z-20">
        <ActionIcon icon="like" count="12K" />
        <ActionIcon icon="comment" count="456" />
        <ActionIcon icon="share" label="Share" />
      </div>

      {/* Bottom Info Section - Ultra Clean, Legible */}
      <div className="absolute bottom-0 left-0 right-0 p-10 pb-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10">
        <div className="flex items-center space-x-5 mb-8">
          <Link 
            href={`/${video.userId?.username}`}
            className="w-16 h-16 rounded-2xl bg-[#F0E7D5] p-[3px] shadow-2xl hover:scale-110 transition-transform"
          >
            <div className="w-full h-full bg-[#212842] rounded-[calc(1rem-3px)] flex items-center justify-center font-black text-[#F0E7D5] text-lg">
              {(video.userId?.username || 'V')[0].toUpperCase()}
            </div>
          </Link>
          <div className="flex flex-col">
            <Link href={`/${video.userId?.username}`} className="text-white font-black text-2xl hover:text-[#F0E7D5] transition-colors drop-shadow-xl tracking-tight">
              @{video.userId?.username || "creator"}
            </Link>
            <span className="text-[12px] text-[#F0E7D5]/60 font-black tracking-widest uppercase">Certified Creator</span>
          </div>
          <button className="px-6 py-2.5 bg-[#F0E7D5] !rounded-xl text-[12px] font-black tracking-widest uppercase text-[#212842] hover:scale-105 transition-all ml-6 shadow-xl">Follow</button>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-white font-black text-3xl leading-tight tracking-tight drop-shadow-2xl">{video.title}</h3>
          <p className="text-white/70 text-lg font-medium line-clamp-2 leading-relaxed max-w-[90%] drop-shadow-lg">{video.description}</p>
        </div>

        {/* Audio Track Badge - Specific Color Sync */}
        <div className="mt-10 flex items-center space-x-3 text-white/90 bg-white/10 w-fit px-6 py-3 rounded-2xl border border-white/20 backdrop-blur-3xl">
          <svg className="w-6 h-6 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <span className="text-[12px] font-black tracking-[0.2em] uppercase">Original Soundtrack</span>
        </div>
      </div>

      {/* Progress Bar - Foreground Sync */}
      <div className="absolute bottom-0 left-0 w-full z-30 h-2.5 bg-white/10">
        <div className="h-full bg-gradient-to-r from-[#F0E7D5] to-[#4B5A8F] shadow-[0_0_20px_rgba(240,231,213,0.7)] transition-all duration-300" style={{ width: '45%' }}></div>
      </div>
    </div>
  );
}

function ActionIcon({ icon, count, label }: { icon: string; count?: string; label?: string }) {
  const icons: any = {
    like: <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    comment: <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    share: <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
  };

  return (
    <button className="flex flex-col items-center group">
      <div className="p-5 rounded-[1.75rem] bg-[#F0E7D5]/90 backdrop-blur-2xl border border-white/20 text-[#212842] group-hover:bg-[#212842] group-hover:text-[#F0E7D5] group-hover:border-[#F0E7D5] transition-all shadow-[0_20px_40px_-5px_rgba(0,0,0,0.6)]">
        {icons[icon]}
      </div>
      <span className="text-[12px] font-black text-white mt-4 drop-shadow-2xl uppercase tracking-[0.3em]">{count || label}</span>
    </button>
  );
}
