import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Comment from "@/Models/Comment";
import Video from "@/Models/video";
import Notification from "@/Models/Notification";

// GET — fetch comments for a video
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();
    const { id: videoId } = await params;
    const comments = await Comment.find({ videoId })
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(comments);
  } catch (error) {
    console.error("Comments GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST — add a comment
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { text } = await req.json();
    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }

    await connectToDatabase();
    const userId = (session.user as any).id;
    const { id: videoId } = await params;

    const comment = await Comment.create({ userId, videoId, text: text.trim() });
    const populated = await comment.populate("userId", "username email");

    // Notify video owner
    if (!videoId.startsWith("pexels_")) {
      const video = await Video.findById(videoId).lean();
      if (video && video.userId.toString() !== userId) {
        await Notification.create({
          recipientId: video.userId,
          senderId: userId,
          type: "comment",
          reelId: videoId,
        });
      }
    }

    return NextResponse.json(populated);
  } catch (error) {
    console.error("Comment POST error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
