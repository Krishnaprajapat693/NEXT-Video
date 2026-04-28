import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/Models/video";
import Like from "@/Models/Like";
import Comment from "@/Models/Comment";

// DELETE — delete own reel
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const userId = (session.user as any).id;
    const { id: videoId } = await params;
    const video = await Video.findById(videoId);

    if (!video) return NextResponse.json({ error: "Reel not found" }, { status: 404 });
    if (video.userId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete associated likes and comments
    await Like.deleteMany({ videoId });
    await Comment.deleteMany({ videoId });
    await Video.deleteOne({ _id: videoId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Video DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
