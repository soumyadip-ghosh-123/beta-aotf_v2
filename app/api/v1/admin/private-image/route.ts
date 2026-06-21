import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

import { reportError } from "@/lib/sentry-report";

const ALLOWED_IMAGES = ["sign.png", "paid.png", "unpaid.png"];

export async function GET(request: NextRequest) {
  try {
    const imageName = request.nextUrl.searchParams.get("name");

    if (!imageName) {
      return new NextResponse("Image name is required", { status: 400 });
    }

    if (!ALLOWED_IMAGES.includes(imageName)) {
      return new NextResponse("Invalid image name", { status: 400 });
    }

    // Images live at <project-root>/assets/private/
    const imagePath = path.join(process.cwd(), "assets", "private", imageName);

    if (!fs.existsSync(imagePath)) {
      console.error(`Private image not found at: ${imagePath}`);
      return new NextResponse("Image not found", { status: 404 });
    }

    const imageBuffer = fs.readFileSync(imagePath);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    reportError(error, { route: "GET /api/v1/admin/private-image" });
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
