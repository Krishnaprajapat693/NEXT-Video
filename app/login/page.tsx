// "use client";

// import { useState } from "react";
// import { signIn } from "next-auth/react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";

// export default function LoginPage() {
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [error, setError] = useState("");
//     const [loading, setLoading] = useState(false);
//     const router = useRouter();

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setError("");
//         setLoading(true);

//         try {
//             const result = await signIn("credentials", {
//                 redirect: false,
//                 email,
//                 password,
//             });

//             if (result?.error) {
//                 setError(result.error);
//             } else {
//                 router.push("/");
//                 router.refresh();
//             }
//         } catch (err) {
//             setError("An unexpected error occurred. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden bg-[#F0E7D5] font-sans">
//             {/* Background shapes for glassmorphism effect */}
//             <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-[#212842]/20 to-transparent rounded-full blur-3xl pointer-events-none" />
//             <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tl from-[#212842]/30 to-transparent rounded-full blur-3xl pointer-events-none" />
            
//             <div className="relative w-full max-w-lg z-10 p-6 sm:p-12" style={{ background: "rgba(255, 255, 255, 0.2)", backdropFilter: "blur(15px)", WebkitBackdropFilter: "blur(15px)", border: "1px solid rgba(255, 255, 255, 0.5)", borderRadius: "2rem", boxShadow: "0 25px 50px -12px rgba(33,40,66,0.15)" }}>
//                 <div className="text-center mb-10">
//                     <div className="w-16 h-16 bg-gradient-to-tr from-[#212842] to-[#3a4570] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#212842]/30">
//                         <svg className="w-8 h-8 text-[#F0E7D5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                         </svg>
//                     </div>
//                     <h1 className="text-4xl font-black text-[#212842] mb-2 tracking-tight">
//                         Welcome Back
//                     </h1>
//                     <p className="text-[#212842]/60 font-medium text-sm tracking-wide">Video Kit &mdash; Premium Access</p>
//                 </div>

//                 <form onSubmit={handleSubmit} className="space-y-6">
//                     <div className="space-y-2">
//                         <label className="block text-xs font-bold text-[#212842]/70 uppercase tracking-widest ml-1">
//                             Email Address
//                         </label>
//                         <input
//                             type="email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             className="w-full px-5 py-4 bg-white/40 border border-white/50 rounded-xl text-[#212842] font-semibold placeholder-[#212842]/30 focus:border-[#212842]/40 focus:ring-4 focus:ring-[#212842]/10 transition-all outline-none"
//                             placeholder="you@example.com"
//                             required
//                         />
//                     </div>

//                     <div className="space-y-2">
//                         <label className="block text-xs font-bold text-[#212842]/70 uppercase tracking-widest ml-1">
//                             Password
//                         </label>
//                         <input
//                             type="password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             className="w-full px-5 py-4 bg-white/40 border border-white/50 rounded-xl text-[#212842] font-semibold placeholder-[#212842]/30 focus:border-[#212842]/40 focus:ring-4 focus:ring-[#212842]/10 transition-all outline-none"
//                             placeholder="••••••••"
//                             required
//                         />
//                     </div>

//                     {error && (
//                         <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-700 rounded-xl text-sm font-semibold text-center backdrop-blur-md">
//                             {error === "CredentialsSignin" ? "Invalid credentials." : error}
//                         </div>
//                     )}

//                     <button
//                         type="submit"
//                         disabled={loading}
//                         className="w-full py-4 mt-4 bg-[#212842] text-[#F0E7D5] font-bold text-lg rounded-xl shadow-lg shadow-[#212842]/30 hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
//                     >
//                         {loading ? "Signing in..." : "Sign In"}
//                     </button>
//                 </form>

//                 <p className="mt-10 text-center text-[#212842]/60 font-medium text-sm">
//                     Don't have an account?{" "}
//                     <Link
//                         href="/register"
//                         className="text-[#212842] font-bold hover:underline underline-offset-4 decoration-2 transition-all"
//                     >
//                         Create one now
//                     </Link>
//                 </p>
//             </div>
//         </div>
//     );
// }

 


"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError(result.error);
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-8 bg-[#F2EDE4] font-sans overflow-hidden">
            
            {/* Global Navbar */}
            <div className="absolute top-0 left-0 w-full p-8 px-10 md:px-16 flex justify-between items-center z-50">
                <div className="font-black text-[28px] text-[#2B3146] tracking-tight">
                    Video Kit
                </div>
                <div className="hidden md:flex gap-8 text-[13px] font-bold text-[#2B3146] uppercase tracking-wider">
                    <Link href="/" className="hover:text-black transition-colors">Home</Link>
                    <Link href="#" className="hover:text-black transition-colors">Gallery</Link>
                    <Link href="#" className="hover:text-black transition-colors">Blog</Link>
                </div>
            </div>

            {/* Background Blurry Blobs */}
            <div className="absolute top-[-5%] left-[-2%] w-[550px] h-[550px] bg-[#292F47]/90 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[0%] w-[650px] h-[650px] bg-[#292F47]/90 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute top-[5%] right-[28%] w-[250px] h-[250px] bg-[#E3CAA5]/50 rounded-full blur-[80px] pointer-events-none" />

            {/* Main Glass Container */}
            <div className="relative w-full max-w-[1050px] bg-[#3B415A]/85 backdrop-blur-xl rounded-[20px] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex flex-col md:flex-row z-10 border border-white/10 min-h-[580px]">
                
                {/* Left Side: Form Section */}
                <div className="w-full md:w-[50%] p-8 flex flex-col items-center justify-center relative">
                    
                    {/* Centered Wrapper for Text & Form */}
                    <div className="w-full max-w-[380px]">
                        
                        {/* Heading Area */}
                        <div className="text-center" style={{ marginBottom: '32px' }}>
                            <h1 className="text-[22px] font-bold text-white tracking-[0.1em] uppercase" style={{ marginBottom: '6px' }}>
                                Welcome Back!
                            </h1>
                            <p className="text-gray-300 text-[14px]">
                                Don't have an account? <Link href="/register" className="text-white hover:underline">Sign up</Link>
                            </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            
                            {/* Email Input */}
                            <div style={{ marginBottom: '24px' }}>
                                <label className="block text-[15px] font-normal text-white/90 tracking-wide" style={{ marginBottom: '8px' }}>
                                    Email Address
                                </label>
                                <div className="relative flex items-center bg-[#EBE7DD] border-[4px] border-[#505770] rounded-full overflow-hidden h-[54px]">
                                    <div className="absolute left-4 text-[#4A5063] pointer-events-none flex items-center justify-center z-10">
                                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                                        </svg>
                                    </div>
                                    {/* GUARANTEED PADDING WITH INLINE CSS */}
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-full bg-transparent text-[#2B3146] font-medium placeholder-[#7A7F93] focus:outline-none"
                                        style={{ paddingLeft: '50px', paddingRight: '20px' }}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div style={{ marginBottom: '20px' }}>
                                <label className="block text-[15px] font-normal text-white/90 tracking-wide" style={{ marginBottom: '8px' }}>
                                    Password
                                </label>
                                <div className="relative flex items-center bg-[#EBE7DD] border-[4px] border-[#505770] rounded-full overflow-hidden h-[54px]">
                                    <div className="absolute left-4 text-[#4A5063] pointer-events-none flex items-center justify-center z-10">
                                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>
                                        </svg>
                                    </div>
                                    {/* GUARANTEED PADDING WITH INLINE CSS */}
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-full bg-transparent text-[#2B3146] font-black placeholder-[#7A7F93] focus:outline-none tracking-[0.2em]"
                                        style={{ paddingLeft: '50px', paddingRight: '50px' }}
                                        placeholder="••••••••"
                                        required
                                    />
                                    <div className="absolute right-4 text-[#4A5063] cursor-pointer hover:text-black flex items-center justify-center z-10">
                                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                                            <line x1="3" y1="3" x2="21" y2="21" strokeWidth="2" strokeLinecap="round"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Remember me & Forgot Password */}
                            <div className="flex justify-between items-center text-[13px]" style={{ marginBottom: '24px' }}>
                                <label className="flex items-center gap-2.5 cursor-pointer group">
                                    <div className="w-[18px] h-[18px] rounded-full bg-white flex items-center justify-center border border-white/20 group-hover:bg-gray-100 transition-colors"></div>
                                    <span className="text-gray-300">Remember me</span>
                                </label>
                                <Link href="#" className="text-[#FCD771] hover:underline">
                                    Forget password?
                                </Link>
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/20 text-red-200 rounded-full text-sm font-medium text-center" style={{ marginBottom: '16px' }}>
                                    {error === "CredentialsSignin" ? "Invalid credentials." : error}
                                </div>
                            )}

                            {/* Sign In Button */}
                            <div style={{ marginBottom: '16px' }}>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3.5 bg-[#FCD771] text-[#2B3146] font-bold text-[17px] rounded-full hover:bg-[#e8c668] transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? "Signing In..." : "Sign In"}
                                </button>
                            </div>

                            {/* Bottom create account link */}
                            <div className="text-center">
                                <p className="text-[#A3A8B8] text-[13px]">
                                    Don't have an account? <Link href="/register" className="text-[#FCD771] hover:underline">Create one now</Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Vertical Subtle Divider */}
                <div className="hidden md:flex flex-col justify-center items-center relative z-20">
                    <div className="w-px h-[65%] bg-white/10"></div>
                </div>

                {/* Right Side: Yellow Circle & Social Icons */}
                <div className="hidden md:flex w-[50%] relative items-center justify-center p-8">
                    
                    {/* Yellow Background Circle for Panda */}
                    <div className="relative w-[340px] h-[340px] bg-[#FCD771] rounded-full flex items-center justify-center overflow-hidden border-4 border-transparent">
                        {/* PANDA IMAGE HERE */}
                        <img src="/panda21.png" alt="panda" className="w-full h-full object-cover" />
                    </div>

                    {/* Social Icons (Right edge aligned) */}
                    <div className="absolute right-6 top-1/2 transform -translate-y-1/2 flex flex-col gap-3.5">
                        {[
                            { name: 'Twitter', path: "M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" },
                            { name: 'GitHub', path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" },
                            { name: 'Globe', path: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" },
                            { name: 'Facebook', path: "M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" },
                            { name: 'Instagram', path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01 M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" }
                        ].map((icon, index) => (
                            <div key={index} className="w-[32px] h-[32px] rounded-full bg-[#EFECE1] text-[#2B3146] flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                    <path d={icon.path} />
                                </svg>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}