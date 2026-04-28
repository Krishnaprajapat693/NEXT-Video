import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/Models/User";
import Video from "@/Models/video";

// GET /api/users/[username] — public profile
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    await connectToDatabase();
    const { username } = await params;

    // Support lookup by username string or MongoDB ObjectId
    let user: any = null;
    if (/^[a-f\d]{24}$/i.test(username)) {
      user = await User.findById(username)
        .select("username email followers following")
        .lean();
    } else {
      user = await User.findOne({ username })
        .select("username email followers following")
        .lean();
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const reels = await Video.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    const currentUserId = (session?.user as any)?.id || null;
    const isFollowing = currentUserId
      ? user.followers?.some((id: any) => id.toString() === currentUserId)
      : false;

    return NextResponse.json({
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
      reelsCount: reels.length,
      isFollowing,
      reels: reels.map((r: any) => ({
        _id: r._id.toString(),
        title: r.title,
        videoUrl: r.videoUrl,
        thumbnailUrl: r.thumbnailUrl,
        description: r.description,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    console.error("Public profile error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
