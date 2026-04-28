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

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const caption = (formData.get("caption") as string) || "";

    if (!file) return NextResponse.json({ error: "File is required" }, { status: 400 });

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isVideo && !isImage) {
      return NextResponse.json({ error: "File must be an image or video" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop() || (isVideo ? "mp4" : "jpg");
    const filename = `story_${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "stories");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    const mediaUrl = `/stories/${filename}`;
    const userId = (session.user as any).id;

    await connectToDatabase();
    const story = await Story.create({
      userId,
      mediaUrl,
      mediaType: isVideo ? "video" : "image",
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
