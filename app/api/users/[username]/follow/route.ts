import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/Models/User";
import Notification from "@/Models/Notification";

// POST /api/users/[username]/follow — toggle follow/unfollow
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const currentUserId = (session.user as any).id;
    const { username } = await params;

    // Support both MongoDB ObjectId and username in the URL
    let targetUser: any = null;
    if (/^[a-f\d]{24}$/i.test(username)) {
      targetUser = await User.findById(username);
    } else {
      targetUser = await User.findOne({ username });
    }

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetUserId = targetUser._id.toString();
    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
    }

    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return NextResponse.json({ error: "Current user not found" }, { status: 404 });
    }

    const isFollowing = currentUser.following?.some(
      (id: any) => id.toString() === targetUserId
    );

    if (isFollowing) {
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });
      return NextResponse.json({ following: false });
    } else {
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } });

      // Fire follow notification
      await Notification.create({
        recipientId: targetUserId,
        senderId: currentUserId,
        type: "follow",
      });

      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error("Follow toggle error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
