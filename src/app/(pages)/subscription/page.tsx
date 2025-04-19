"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import useAuthStore from "@/store/useStore";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertCircle, Loader2 } from "lucide-react";

export default function SubscriptionPage() {
  const [productId, setProductId] = useState("subscription");
  const [varient, setVarient] = useState("lifetime");
  const { isAuthenticated } = useAuthStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Load Razorpay script
  useEffect(() => {
    const loadRazorpayScript = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        setErrorMessage("Payment gateway failed to load. Please try again later.");
      };
      document.body.appendChild(script);
    };

    // Detect if user is on mobile
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      setIsMobile(
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      );
    };

    loadRazorpayScript();
    checkIfMobile();

    return () => {
      // Cleanup if needed
      const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (existingScript) {
        // Just mark as loaded instead of removing, in case other components need it
        setRazorpayLoaded(true);
      }
    };
  }, []);

  const handleCheckOut = async () => {
    // Reset error message
    setErrorMessage(null);
    
    try {
      setIsLoading(true);

      if (!razorpayLoaded) {
        throw new Error("Payment gateway not loaded. Please refresh the page.");
      }

      // Step 1: Create order on the backend
      const res = await axios.post("/api/orders", { productId, varient });

      if (!res.data.razorpayOrder || !res.data.razorpayOrder.id) {
        throw new Error("Failed to create payment order. Please try again.");
      }

      const { razorpayOrder, order } = res.data;

      // Step 2: Configure Razorpay options with better mobile handling
      const options: any = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "", // Using public env var
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "TypeBlaze",
        description: "Lifetime Subscription",
        order_id: razorpayOrder.id,
        handler: async (response: any) => {
          try {
            const verificationRes = await axios.post("/api/verify-payment", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verificationRes.data.success) {
              alert("Payment Successful! Subscription Activated.");
              window.location.reload();
            } else {
              setErrorMessage("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            console.error("Verification Error:", error);
            setErrorMessage("Payment verification failed. Please try again or contact support.");
          }
        },
        modal: {
          ondismiss: function() {
            setIsLoading(false);
          },
          escape: true,
        },
        theme: { 
          color: "#3399cc",
        },
      };

      // Add mobile-specific options for better compatibility
      if (isMobile) {
        options.theme.backdrop_color = "#000000";
        options.display_logo = false; // Reduces load time on mobile
      }

      // Step 3: Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', function (response: any) {
        setErrorMessage("Payment failed. Please try again.");
        setIsLoading(false);
      });
      razorpay.open();
    } catch (error: any) {
      console.error("Order Creation Error:", error);
      setErrorMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800 dark:text-gray-100">
          Join TypeBlaze
        </h1>
        <Card className="w-full bg-white dark:bg-gray-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-blue-500">
              Lifetime Access
            </CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-300">
              Unlock all features forever
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <span className="text-5xl font-bold text-gray-800 dark:text-gray-100">INR 9</span>
              <span className="text-gray-600 dark:text-gray-300"> / one-time</span>
            </div>
            <ul className="mt-6 space-y-2">
              {[
                "Unlimited typing tests",
                "Advanced statistics",
                "Custom test creation",
                "Ad-free experience",
                "Priority support",
              ].map((feature, index) => (
                <li key={index} className="flex items-center text-gray-600 dark:text-gray-300">
                  <svg className="w-5 h-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                {errorMessage}
              </div>
            )}
          </CardContent>
          <CardFooter>
            {isAuthenticated ? (
              <Button
                onClick={handleCheckOut}
                className="w-full rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 transition duration-300"
                disabled={isLoading || !razorpayLoaded}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin mr-2" />
                ) : !razorpayLoaded ? (
                  "Loading Payment Gateway..."
                ) : (
                  "Get Lifetime Access"
                )}
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip open={isHovered}>
                  <TooltipTrigger asChild>
                    <div
                      className="w-full"
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <Button disabled className="w-full rounded-lg bg-blue-500 text-white font-bold py-2 px-4 cursor-not-allowed">
                        Get Lifetime Access
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="flex items-center">
                      <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                      <span>Please log in first to proceed</span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
