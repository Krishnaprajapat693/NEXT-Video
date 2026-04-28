import { connect } from "http2";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "./db";
import User from "@/Models/User";
import bcrypt from "bcryptjs";
export const authOptions : NextAuthOptions= {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "Enter your email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email and password are required"); 
                }
                try {
                    await connectToDatabase();
                    const user = await User.findOne({ email: credentials.email });
                    if (!user) {
                        throw new Error("User not found");
                    }
                    const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                    if (!isPasswordValid) {
                        throw new Error("Invalid password");
                    }
                    return { id: user._id.toString(), email: user.email, username: user.username };
                } catch (error) {
                    console.log("authorize error", error);
                    throw new Error("Failed to authorize user");
                }
            },    
        }),
    ],  
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.username = (user as any).username;
            }
            if (trigger === "update" && session?.username) {
                token.username = session.username;
            }
            return token;
        },
        async session({ session , token}) {
            if (session.user) {
                (session.user as any).id = token.id as string;
                (session.user as any).username = token.username as string;
            }
            return session;
        },
    } ,        
      
    pages: {
        signIn: "/login",
        error: "/login",
    }, 
    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,      
    },
    secret: process.env.NEXTAUTH_SECRET,
};
