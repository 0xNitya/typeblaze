import { NextRequest, NextResponse } from "next/server";
import { connectDb } from "@/dbconfig/dbconfig";
import User from "@/models/user.model";
import Order from "@/models/order.model";
import { getDataFromToken } from "@/lib/getDataFromToken";

export async function POST(request: NextRequest) {
  try {
    // Connect to the database
    await connectDb();

    // Get and verify the user token
    const userId = getDataFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }

    // Get the order details from the request
    const body = await request.json();
    const { orderId, paymentId } = body;

    // Validate the request body
    if (!orderId || !paymentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Find the order to verify it exists and is valid
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update the user to premium status
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isPremium: true,
        premiumSince: new Date(),
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return success response with the updated user
    return NextResponse.json({
      success: true,
      message: "User upgraded to premium successfully",
      data: {
        user: {
          id: user._id,
          fullname: user.fullname,
          email: user.email,
          username: user.username,
          isPremium: user.isPremium,
          premiumSince: user.premiumSince,
        },
      },
    });
  } catch (error: any) {
    console.error("Error upgrading user to premium:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 