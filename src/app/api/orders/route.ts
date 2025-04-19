import { connectDb } from '@/dbconfig/dbconfig';
import { getDataFromToken } from '@/lib/getDataFromToken';
import Order from '@/models/order.model';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Initialize Razorpay with environment variables
let razorpay: Razorpay;
try {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!key_id || !key_secret) {
        console.error("Razorpay keys are missing");
    }
    
    razorpay = new Razorpay({
        key_id: key_id as string,   
        key_secret: key_secret as string,  
    });
} catch (error) {
    console.error("Failed to initialize Razorpay:", error);
}

export async function POST(request: NextRequest)
 {
    try {
        // Get user ID from token
        const reqUserId = getDataFromToken(request);
        if (!reqUserId) {
            return NextResponse.json(
                { message: "Authentication required", success: false },
                { status: 401 }
            );
        }

        // Parse and validate request body
        let body;
        try {
            body = await request.json();
        } catch (error) {
            return NextResponse.json(
                { message: "Invalid request body", success: false },
                { status: 400 }
            );
        }

        const { productId, varient } = body;
        if (!productId || !varient) {
            return NextResponse.json(
                { message: "productId and varient are required", success: false },
                { status: 400 }
            );
        }

        // Check if Razorpay is initialized
        if (!razorpay) {
            return NextResponse.json(
                { message: "Payment service is not available", success: false },
                { status: 503 }
            );
        }

        try {
            await connectDb();
        } catch (dbError) {
            console.error("Database connection error:", dbError);
            return NextResponse.json(
                { message: "Failed to connect to database", success: false },
                { status: 500 }
            );
        }

        // Create Razorpay order
        let order;
        try {
            order = await razorpay.orders.create({
                amount: 9 * 100, // Convert ₹9 to paisa
                currency: 'INR',
                receipt: `receipt-${Date.now()}`,
                notes: {
                    productId: productId.toString(),
                    varient,
                    userId: reqUserId.toString(),
                },
            });

            // Ensure order was created successfully
            if (!order || !order.id) {
                return NextResponse.json(
                    { message: "Failed to create payment order", success: false },
                    { status: 500 }
                );
            }
        } catch (razorpayError) {
            console.error("Razorpay order creation error:", razorpayError);
            return NextResponse.json(
                { message: "Failed to create payment order", success: false },
                { status: 500 }
            );
        }

        // Save order in database
        try {
            const newOrder = await Order.create({
                userId: reqUserId,
                items: [{
                    productId,
                    quantity: 1,
                }],
                orderDate: new Date(),
                status: 'pending',
                amount: 9,
                paymentMethod: 'razorpay',
                paymentStatus: 'pending',
                paymentDate: new Date(),
                razorpayOrderId: order.id,
            });

            return NextResponse.json({
                message: "Order created successfully",
                success: true,
                order: newOrder,
                razorpayOrder: {
                    id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                },
            }, { status: 200 });
        } catch (dbError) {
            console.error("Database error while saving order:", dbError);
            return NextResponse.json(
                { message: "Failed to save order details", success: false },
                { status: 500 }
            );
        }

    } catch (error: any) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { message: "Internal Server Error", success: false },
            { status: 500 }
        );
    }
}
