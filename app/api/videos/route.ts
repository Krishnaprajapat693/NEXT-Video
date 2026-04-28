import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Video from "@/Models/video";
import Like from "@/Models/Like";
import Comment from "@/Models/Comment";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const query = searchParams.get("query") || "nature";
    const currentUserId = (session?.user as any)?.id || null;

    // Pexels videos
    const pexelsRes = await fetch(
      `https://api.pexels.com/videos/search?query=${query}&per_page=15&page=${page}&orientation=portrait`,
      {
        headers: { Authorization: process.env.PEXELS_API_KEY || "" },
        next: { revalidate: 3600 },
      }
    );

    let pexelsVideos: any[] = [];
    if (pexelsRes.ok) {
      const pexelsData = await pexelsRes.json();
      pexelsVideos = pexelsData.videos?.map((v: any) => {
        const videoFile =
          v.video_files.find(
            (f: any) => f.file_type === "video/mp4" && (f.height >= 1080 || f.width >= 720)
          ) || v.video_files[0];
        return {
          _id: `pexels_${v.id}`,
          title: v.url.split("/").pop()?.split("-").slice(0, -1).join(" ") || "Awesome Reel",
          description: `Video by ${v.user.name} on Pexels. #${query} #reels`,
          videoUrl: videoFile.link,
          thumbnailUrl: v.image,
          controls: true,
          userId: { username: v.user.name, email: "" },
          likesCount: 0,
          commentsCount: 0,
          isLiked: false,
          isPexels: true,
        };
      }) || [];
    }

    if (page === "1") {
      try {
        await connectToDatabase();
        const dbVideos = await Video.find({})
          .sort({ createdAt: -1 })
          .populate("userId", "username email")
          .lean();

        // Attach likes, comments, isLiked for each DB video
        const enriched = await Promise.all(
          dbVideos.map(async (v: any) => {
            const [likesCount, commentsCount, liked] = await Promise.all([
              Like.countDocuments({ videoId: v._id }),
              Comment.countDocuments({ videoId: v._id }),
              currentUserId
                ? Like.exists({ userId: currentUserId, videoId: v._id })
                : Promise.resolve(null),
            ]);
            return {
              ...v,
              _id: v._id.toString(),
              likesCount,
              commentsCount,
              isLiked: !!liked,
              isPexels: false,
            };
          })
        );

        return NextResponse.json([...enriched, ...pexelsVideos]);
      } catch (dbError) {
        console.error("DB fetch failed, returning Pexels only:", dbError);
        return NextResponse.json(pexelsVideos);
      }
    }

    return NextResponse.json(pexelsVideos);
  } catch (error) {
    console.error("Fetch videos error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
