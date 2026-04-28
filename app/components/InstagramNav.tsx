"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useProfile } from "@/app/context/ProfileContext";

const NAV = [
  { href: "/", label: "Feed", icon: "grid" },
  { href: "/search", label: "Explore", icon: "search" },
  { href: "/notifications", label: "Notifications", icon: "bell", badge: true },
  { href: "/reels", label: "Reels", icon: "tv" },
  { href: "/upload", label: "Create", icon: "plus" },
  { href: "/profile", label: "Settings", icon: "settings" },
];

export default function InstagramNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { profile } = useProfile();
  const [unread, setUnread] = React.useState(0);

  // Poll notifications only (profile stats now come from context)
  React.useEffect(() => {
    if (!session) return;
    const fetchUnread = () => {
      fetch("/api/notifications")
        .then(r => r.json())
        .then(d => { if (typeof d.unreadCount === "number") setUnread(d.unreadCount); })
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [session]);

  if (pathname === "/login" || pathname === "/register") return null;

  const username = session?.user?.name || "User";
  const displayName = profile?.username || (session?.user as any)?.username || username;

  return (
    <>
      <aside
        className="hidden sm:flex flex-col flex-shrink-0"
        style={{ width: 220, minWidth: 220, height: "100vh", background: "#212842", color: "#F0E7D5", padding: "24px 16px", overflowY: "auto" }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 28, paddingLeft: 4 }}>
          <div style={{ width: 32, height: 32, background: "#F0E7D5", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#212842"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </div>
          <span style={{ color: "#F0E7D5", fontWeight: 700, fontSize: 15, fontStyle: "italic" }}>Video Kit</span>
        </div>

        {/* Profile Summary */}
        <div style={{ paddingLeft: 4, marginBottom: 20 }}>
          <div style={{ position: "relative", width: 60, height: 60, marginBottom: 12 }}>
            <div style={{ width: 60, height: 60, borderRadius: "50%", background: "rgba(240,231,213,0.15)", border: "2px solid rgba(240,231,213,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 900, color: "#F0E7D5" }}>
              {displayName[0]?.toUpperCase() || "U"}
            </div>
            {session && <div style={{ position: "absolute", bottom: -2, right: -2, width: 18, height: 18, borderRadius: "50%", background: "#F0E7D5", border: "2px solid #212842", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 9, height: 9, borderRadius: "50%", background: "#4ade80" }} /></div>}
          </div>
          <p style={{ color: "#F0E7D5", fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{session ? displayName : "Guest"}</p>
          <p style={{ color: "rgba(240,231,213,0.4)", fontSize: 11 }}>@{session ? displayName.toLowerCase() : "guest"}</p>

          {session && (
            <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
              {[
                [profile?.reelsCount ?? "—", "Posts"],
                [profile?.followersCount ?? "—", "Followers"],
                [profile?.followingCount ?? "—", "Following"],
              ].map(([val, lbl]) => (
                <div key={lbl as string} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ color: "#F0E7D5", fontSize: 13, fontWeight: 800 }}>{val as React.ReactNode}</span>
                  <span style={{ color: "rgba(240,231,213,0.4)", fontSize: 10, fontWeight: 500 }}>{lbl as string}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ height: 1, background: "rgba(240,231,213,0.1)", marginBottom: 12 }} />

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV.map(({ href, label, icon, badge }) => {
            const isActive = pathname === href;
            return (
              <Link key={href} href={href} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, color: isActive ? "#F0E7D5" : "rgba(240,231,213,0.55)", fontWeight: isActive ? 700 : 500, fontSize: 13.5, background: isActive ? "rgba(240,231,213,0.10)" : "transparent", textDecoration: "none", transition: "background 0.15s, color 0.15s" }}>
                <NavIcon icon={icon} />
                <span style={{ flex: 1 }}>{label}</span>
                {isActive && <div style={{ width: 3, height: 20, borderRadius: 99, background: "#F0E7D5" }} />}
                {badge && unread > 0 && !isActive && <span style={{ background: "rgba(240,231,213,0.15)", color: "#F0E7D5", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 99, minWidth: 18, textAlign: "center" }}>{unread}</span>}
              </Link>
            );
          })}
        </nav>

        <div>
          <div style={{ height: 1, background: "rgba(240,231,213,0.1)", marginBottom: 10, marginTop: 8 }} />
          {session ? (
            <button onClick={() => signOut()} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, width: "100%", background: "transparent", border: "none", cursor: "pointer", color: "rgba(240,231,213,0.55)", fontSize: 13.5, fontWeight: 500, transition: "background 0.15s, color 0.15s" }}>
              <NavIcon icon="logout" />
              <span>Logout</span>
            </button>
          ) : (
            <Link href="/login" style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 10, color: "#F0E7D5", fontSize: 13.5, fontWeight: 700, background: "rgba(240,231,213,0.08)", textDecoration: "none" }}>
              <NavIcon icon="logout" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-4 py-3 border-t" style={{ background: "#212842", borderColor: "rgba(240,231,213,0.1)" }}>
        {["/", "/search", "/upload", "/reels", "/profile"].map((href, i) => {
          const icons = ["grid", "search", "plus", "tv", "person"];
          return (
            <Link key={href} href={href} style={{ padding: 8, borderRadius: 10, color: pathname === href ? "#F0E7D5" : "rgba(240,231,213,0.4)" }}>
              <NavIcon icon={icons[i]} />
            </Link>
          );
        })}
      </nav>
    </>
  );
}

function NavIcon({ icon }: { icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    grid: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,
    bell: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    tv: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/></svg>,
    plus: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    settings: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 1 0 4.93 19.07 10 10 0 0 0 19.07 4.93z"/></svg>,
    stats: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    logout: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    person: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  };
  return <>{icons[icon] || icons.grid}</>;
}
