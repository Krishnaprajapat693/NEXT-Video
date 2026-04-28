import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/Models/User";
import Video from "@/Models/video";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) return NextResponse.json([]);

    await connectToDatabase();

    const users = await User.find({ username: { $regex: query, $options: "i" } })
      .select("username email followers following")
      .limit(20)
      .lean();

    const currentUserId = (session?.user as any)?.id || null;

    const formatted = await Promise.all(
      users.map(async (user) => {
        const reelsCount = await Video.countDocuments({ userId: user._id });
        const isFollowing = currentUserId
          ? user.followers?.some((id: any) => id.toString() === currentUserId)
          : false;

        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          followersCount: user.followers?.length || 0,
          followingCount: user.following?.length || 0,
          reelsCount,
          isFollowing,
        };
      })
    );

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
