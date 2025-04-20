import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/dbconfig/dbconfig";
import User from "@/models/user.model";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectDb();

    // Get and verify the user token
    const userId = getDataFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 }
      );
    }

    // Fetch the user from the database (excluding password)
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user data with premium status
    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          username: user.username,
          isPremium: user.isPremium || false,
          premiumSince: user.premiumSince,
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 