import {connectToDatabase} from "@/lib/db";
import User from "@/Models/User";

import { NextRequest ,NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { email, password, username } = await request.json();   

        if (!email || !password || !username) {
            return NextResponse.json({ error: "Email, password, and username are required" }, { status: 400 });
        }
        await connectToDatabase();
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return NextResponse.json({ error: "Email already exists" }, { status: 400 });
        }
        
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return NextResponse.json({ error: "Username already taken" }, { status: 400 });
        }

        await User.create({ email, password, username });
        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    } 
    catch (error) {
        console.log("registration error",error);       
        return NextResponse.json({ error: "Failed to register user" }, { status: 500 });
    }
}