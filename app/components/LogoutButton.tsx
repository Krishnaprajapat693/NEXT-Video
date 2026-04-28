"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
    return (
        <button
            onClick={() => signOut()}
            className="px-6 py-2.5 bg-[#212842] text-[#F0E7D5] font-black rounded-xl border-2 border-[#212842] hover:bg-transparent hover:text-[#212842] transition-all active:scale-95 uppercase text-xs tracking-[0.2em]"
        >
            Terminate Session
        </button>
    );
}
