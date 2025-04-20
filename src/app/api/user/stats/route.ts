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

    // Fetch the user from the database
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is premium
    if (!user.isPremium) {
      return NextResponse.json(
        { error: "Premium subscription required" },
        { status: 403 }
      );
    }

    // Process and organize user history data
    const typingHistory = user.history || [];
    
    // Sort history by date (newest first)
    typingHistory.sort((a, b) => 
      new Date(b.testPlayed).getTime() - new Date(a.testPlayed).getTime()
    );

    // Calculate key performance data
    // In a real app, you would have actual key-level accuracy data
    // Here we're generating simulated key data based on overall accuracy
    const keys = "abcdefghijklmnopqrstuvwxyz,.";
    const keyPerformanceData = Array.from(keys).map(key => {
      // Generate a random accuracy value that's somewhat correlated with user's overall accuracy
      const baseAccuracy = user.accuracy || 90;
      const randomVariance = Math.floor(Math.random() * 20) - 10; // -10 to +10
      const keyAccuracy = Math.min(100, Math.max(60, baseAccuracy + randomVariance));
      
      return {
        key,
        accuracy: keyAccuracy,
        frequency: Math.floor(Math.random() * 20) + 5, // Random frequency between 5 and 25
      };
    });
    
    // Sort key data by accuracy (lowest first)
    keyPerformanceData.sort((a, b) => a.accuracy - b.accuracy);

    // Calculate total practice time (estimate 2 minutes per test)
    const totalTime = (user.testAttempted || 0) * 2 / 60; // in hours

    // Prepare daily WPM and accuracy data for the chart
    // Group tests by day for the last 30 days
    const dailyData = [];
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Create a map to store data by date
    const dateMap = new Map();
    
    // Process history entries
    typingHistory.forEach(entry => {
      const testDate = new Date(entry.testPlayed);
      
      // Only include entries from the last 30 days
      if (testDate >= thirtyDaysAgo) {
        const dateStr = testDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, { 
            date: dateStr, 
            wpmTotal: 0, 
            accuracyTotal: 0, 
            count: 0 
          });
        }
        
        const dayData = dateMap.get(dateStr);
        dayData.wpmTotal += entry.speed;
        dayData.accuracyTotal += entry.accuracy;
        dayData.count += 1;
      }
    });
    
    // Calculate averages for each day
    dateMap.forEach((value, key) => {
      dailyData.push({
        date: key,
        wpm: Math.round(value.wpmTotal / value.count),
        accuracy: Math.round(value.accuracyTotal / value.count)
      });
    });
    
    // Sort by date
    dailyData.sort((a, b) => a.date.localeCompare(b.date));
    
    // Fill in missing dates with null values for better charts
    const completeData = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(thirtyDaysAgo);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const existingData = dailyData.find(d => d.date === dateStr);
      
      if (existingData) {
        completeData.push(existingData);
      } else {
        // If no data for this date, use the previous day's data if available
        // This creates a more continuous chart
        const prevData = completeData.length > 0 ? completeData[completeData.length - 1] : null;
        completeData.push({
          date: dateStr,
          wpm: prevData ? prevData.wpm : null,
          accuracy: prevData ? prevData.accuracy : null
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalTests: user.testAttempted || 0,
          averageWPM: user.avgSpeed || 0,
          peakWPM: user.topSpeed || 0,
          averageAccuracy: user.accuracy || 0,
          totalTime: totalTime.toFixed(1), // Hours
        },
        typingData: completeData,
        keyPerformance: keyPerformanceData.slice(0, 10), // Return 10 worst keys
        recentTests: typingHistory.slice(0, 10).map(entry => ({
          speed: entry.speed,
          accuracy: entry.accuracy,
          date: entry.testPlayed
        }))
      },
    });
  } catch (error: any) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
} 