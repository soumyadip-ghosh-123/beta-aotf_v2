import { NextRequest, NextResponse } from "next/server";
// import { verifyAdminAuth } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication (cookies are automatically sent by browser)
    // const authData = await verifyAdminAuth(request);

    // if (!authData || !authData.isAuthenticated) {
    //   console.log("Private image access denied - no valid admin session");
    //   return new NextResponse("Unauthorized - Admin access required", { 
    //     status: 401,
    //     headers: {
    //       'Content-Type': 'text/plain',
    //     }
    //   });
    // }

    // console.log(`Admin ${authData.admin.email} accessing private image`);


    // Get the image name from query parameter
    const searchParams = request.nextUrl.searchParams;
    const imageName = searchParams.get("name");

    if (!imageName) {
      return new NextResponse("Image name is required", { status: 400 });
    }

    // Validate image name (only allow specific images)
    const allowedImages = ["sign.png", "paid.png", "unpaid.png"];
    if (!allowedImages.includes(imageName)) {
      return new NextResponse("Invalid image name", { status: 400 });
    }

    // Get the absolute path to the image
    const imagePath = path.join(process.cwd(), "assets", "private", imageName);
    console.log(`Serving private image from path: ${imagePath}`);
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      return new NextResponse("Image not found", { status: 404 });
    }

    // Read the file
    const imageBuffer = fs.readFileSync(imagePath);

    // Determine content type based on file extension
    const contentType = "image/png";

    // Return the image
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=3600", // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error("Error serving private image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
