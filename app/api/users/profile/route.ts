import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import User from "@/Models/User";
import Video from "@/Models/video";
import Story from "@/Models/Story";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById((session.user as any).id).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [reelsCount, storiesCount] = await Promise.all([
      Video.countDocuments({ userId: user._id }),
      Story.countDocuments({ userId: user._id, expiresAt: { $gt: new Date() } }),
    ]);

    return NextResponse.json({
      username: user.username,
      email: user.email,
      reelsCount,
      storiesCount,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("PUT Profile session state:", !!session, "User ID:", (session?.user as any)?.id);
    
    if (!session?.user) {
       return NextResponse.json({ error: "Unauthorized - Please log in again" }, { status: 401 });
    }

    const { username } = await req.json();
    console.log("Incoming username request:", username);

    if (!username || username.trim().length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters long" }, { status: 400 });
    }

    const sanitizedUsername = username.toLowerCase().replace(/[^a-z0-9_]/g, "");

    await connectToDatabase();

    // Check if another user already has this username
    const existingUser = await User.findOne({ username: sanitizedUsername });
    if (existingUser && existingUser._id.toString() !== (session.user as any).id) {
       return NextResponse.json({ error: "That username is already taken by another account" }, { status: 400 });
    }

    // Update user - using findOneAndUpdate to be extremely explicit
    const updatedUser = await User.findOneAndUpdate(
      { _id: (session.user as any).id }, 
      { $set: { username: sanitizedUsername } },
      { new: true, runValidators: true }
    );
    
    console.log("Database update result:", !!updatedUser);

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to locate user in database to update" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true,
      message: "Username updated successfully!", 
      username: updatedUser.username 
    });
  } catch (error: any) {
    console.error("Critical Profile Update Error:", error);
    return NextResponse.json({ error: error.message || "A server error occurred during update" }, { status: 500 });
  }
}

