import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Like from "@/Models/Like";
import Video from "@/Models/video";
import Notification from "@/Models/Notification";

// POST — toggle like on a video
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const userId = (session.user as any).id;
    const { id: videoId } = await params;

    // Can only like DB videos (not Pexels)
    if (videoId.startsWith("pexels_")) {
      return NextResponse.json({ error: "Cannot like external videos" }, { status: 400 });
    }

    const existing = await Like.findOne({ userId, videoId });

    if (existing) {
      // Unlike
      await Like.deleteOne({ _id: existing._id });
      const count = await Like.countDocuments({ videoId });
      return NextResponse.json({ liked: false, likesCount: count });
    } else {
      // Like
      await Like.create({ userId, videoId });

      // Notify video owner
      const video = await Video.findById(videoId).lean();
      if (video && video.userId.toString() !== userId) {
        await Notification.create({
          recipientId: video.userId,
          senderId: userId,
          type: "like",
          reelId: videoId,
        });
      }

      const count = await Like.countDocuments({ videoId });
      return NextResponse.json({ liked: true, likesCount: count });
    }
  } catch (error) {
    console.error("Like toggle error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
