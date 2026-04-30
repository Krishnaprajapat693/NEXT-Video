import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/Models/video";


export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, description, mediaUrl, thumbnailUrl } = await req.json();

    if (!title || !mediaUrl) {
      return NextResponse.json({ error: "Title and mediaUrl are required" }, { status: 400 });
    }

    await connectToDatabase();

    const newVideo = await Video.create({
      userId: (session.user as any).id,
      title,
      description,
      videoUrl: mediaUrl,
      thumbnailUrl: thumbnailUrl || mediaUrl,
      controls: true,
      transformation: { width: 1080, height: 1920, quality: 100 },
    });

    return NextResponse.json({ success: true, video: newVideo });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
