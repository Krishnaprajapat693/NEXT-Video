import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Story from "@/Models/Story";

// DELETE — delete own story
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await connectToDatabase();
    const userId = (session.user as any).id;
    const { id: storyId } = await params;
    const story = await Story.findById(storyId);

    if (!story) return NextResponse.json({ error: "Story not found" }, { status: 404 });
    if (story.userId.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await Story.deleteOne({ _id: storyId });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Story DELETE error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
