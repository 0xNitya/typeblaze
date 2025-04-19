import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDb } from "@/dbconfig/dbconfig";
import Order from "@/models/order.model";

export async function POST(request:NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // Validate input parameters
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Missing required payment information" 
        }, 
        { status: 400 }
      );
    }

    // Check if key secret is configured
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      console.error("RAZORPAY_KEY_SECRET is not configured");
      return NextResponse.json(
        { 
          success: false, 
          message: "Payment verification configuration error" 
        }, 
        { status: 500 }
      );
    }

    // Generate the expected signature
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    // Compare the received signature with the generated signature
    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Payment signature verification failed" 
        }, 
        { status: 400 }
      );
    }

    try {
      // If signature is valid, update payment status in the database
      await connectDb();

      const order = await Order.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        {
          paymentStatus: "paid",
          paymentId: razorpay_payment_id,
          paymentDate: new Date(),
        }
      );

      if (!order) {
        return NextResponse.json(
          { 
            success: false, 
            message: "Order not found in our system" 
          }, 
          { status: 404 }
        );
      }

      return NextResponse.json(
        { 
          success: true, 
          message: "Payment verified successfully" 
        }, 
        { status: 200 }
      );
    } catch (dbError) {
      console.error("Database error during payment verification:", dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: "Database error during payment verification" 
        }, 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Payment verification process failed" 
      }, 
      { status: 500 }
    );
  }
}
