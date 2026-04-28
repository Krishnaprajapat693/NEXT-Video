import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/Models/video";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = (formData.get("description") as string) || "";

    if (!file || !title) {
      return NextResponse.json({ error: "File and title are required" }, { status: 400 });
    }

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      return NextResponse.json({ error: "File must be a video or image" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to appropriate folder
    const subDir = isImage ? "images" : "videos";
    const ext = file.name.split(".").pop() || (isImage ? "jpg" : "mp4");
    const filename = `${Date.now()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", subDir);
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    const mediaUrl = `/${subDir}/${filename}`;
    // For images use the image itself as thumbnail; for videos use a placeholder
    const thumbnailUrl = isImage ? mediaUrl : "/videos/thumb_default.jpg";

    await connectToDatabase();

    const newVideo = await Video.create({
      userId: (session.user as any).id,
      title,
      description,
      videoUrl: mediaUrl,       // Works for both image and video
      thumbnailUrl,
      controls: true,
      transformation: { width: 1080, height: 1920, quality: 100 },
    });

    return NextResponse.json({ success: true, video: newVideo });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
