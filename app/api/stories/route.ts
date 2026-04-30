import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Story from "@/Models/Story";
import User from "@/Models/User";
import fs from "fs";
import path from "path";

// GET — fetch active stories (own + followed users)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();

    const userId = (session.user as any).id;
    const user = await User.findById(userId).lean();
    const followingIds = user?.following || [];

    // Global active stories feed (Instagram Explore style)
    const stories = await Story.find({
      expiresAt: { $gt: new Date() },
    })
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(stories);
  } catch (error) {
    console.error("Stories GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST — upload a new story
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { mediaUrl, mediaType, caption } = await req.json();

    if (!mediaUrl) return NextResponse.json({ error: "mediaUrl is required" }, { status: 400 });

    const userId = (session.user as any).id;

    await connectToDatabase();
    const story = await Story.create({
      userId,
      mediaUrl,
      mediaType,
      caption,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Notify followers about new story
    const user = await User.findById(userId).lean();
    if (user?.followers && user.followers.length > 0) {
      const Notification = (await import("@/Models/Notification")).default;
      const notifs = user.followers.map((followerId: any) => ({
        recipientId: followerId,
        senderId: userId,
        type: "new_story",
        storyId: story._id,
      }));
      await Notification.insertMany(notifs);
    }

    return NextResponse.json({ success: true, story });
  } catch (error) {
    console.error("Story POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
