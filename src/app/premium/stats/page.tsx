"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useStore";
import { Crown, TrendingUp, Clock, Keyboard, Target, Calendar, Award, BarChart as BarChartIcon } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";

interface TypingSession {
  date: string;
  wpm: number | null;
  accuracy: number | null;
}

interface KeyPerformance {
  key: string;
  accuracy: number;
  frequency: number;
}

interface RecentTest {
  speed: number;
  accuracy: number;
  date: string;
}

export default function StatsPage() {
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typingData, setTypingData] = useState<TypingSession[]>([]);
  const [keyPerformance, setKeyPerformance] = useState<KeyPerformance[]>([]);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [averageWPM, setAverageWPM] = useState(0);
  const [peakWPM, setPeakWPM] = useState(0);
  const [averageAccuracy, setAverageAccuracy] = useState(0);
  const [totalTests, setTotalTests] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const router = useRouter();
  const { isPremium } = useAuthStore();

  useEffect(() => {
    // Check premium status
    if (!isPremium) {
      router.push("/subscription");
      return;
    }
    setIsPremiumUser(true);

    // Fetch real user statistics from API
    fetchUserStats();
  }, [isPremium, router]);

  const fetchUserStats = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get<{
        success: boolean;
        data: {
          summary: {
            totalTests: number;
            averageWPM: number;
            peakWPM: number;
            averageAccuracy: number;
            totalTime: string;
          };
          typingData: TypingSession[];
          keyPerformance: KeyPerformance[];
          recentTests: RecentTest[];
        }
      }>('/api/user/stats');
      
      if (response.data && response.data.success) {
        const { summary, typingData, keyPerformance, recentTests } = response.data.data;
        
        // Set state with real data
        setTypingData(typingData || []);
        setKeyPerformance(keyPerformance || []);
        setRecentTests(recentTests || []);
        setAverageWPM(summary.averageWPM || 0);
        setPeakWPM(summary.peakWPM || 0);
        setAverageAccuracy(summary.averageAccuracy || 0);
        setTotalTests(summary.totalTests || 0);
        setTotalTime(parseFloat(summary.totalTime) || 0);
      } else {
        // Handle API error response
        setError("Could not fetch statistics data");
      }
    } catch (err) {
      console.error("Error fetching user statistics:", err);
      setError("Failed to load statistics");
    } finally {
      setIsLoading(false);
    }
  };

  // Formats date for better display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // If not premium, don't render the content
  if (!isPremiumUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-8">
          <Crown className="h-8 w-8 mr-3 text-yellow-500" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Advanced Statistics
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Average WPM</p>
                    <h3 className="text-2xl font-bold">{averageWPM}</h3>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                    <Target className="h-6 w-6 text-green-600 dark:text-green-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Accuracy</p>
                    <h3 className="text-2xl font-bold">{averageAccuracy}%</h3>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
                    <Keyboard className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tests Completed</p>
                    <h3 className="text-2xl font-bold">{totalTests}</h3>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-amber-600 dark:text-amber-300" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Practicing</p>
                    <h3 className="text-2xl font-bold">{totalTime} hours</h3>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="progress" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="progress">Progress Over Time</TabsTrigger>
            <TabsTrigger value="keys">Key Performance</TabsTrigger>
            <TabsTrigger value="recent">Recent Tests</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="progress">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>WPM Over Time</CardTitle>
                  <CardDescription>Your typing speed progress over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 w-full flex items-center justify-center">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : (
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={typingData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => {
                              const d = new Date(date);
                              return `${d.getMonth()+1}/${d.getDate()}`;
                            }}
                          />
                          <YAxis />
                          <Tooltip 
                            formatter={(value) => value ? [value, 'WPM'] : ['No data', 'WPM']}
                            labelFormatter={(label) => formatDate(label)}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="wpm" 
                            stroke="#3B82F6" 
                            activeDot={{ r: 8 }} 
                            connectNulls={true}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Accuracy Over Time</CardTitle>
                  <CardDescription>Your typing accuracy progress over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="h-80 w-full flex items-center justify-center">
                      <Skeleton className="h-64 w-full" />
                    </div>
                  ) : (
                    <div className="h-80 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={typingData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={(date) => {
                              const d = new Date(date);
                              return `${d.getMonth()+1}/${d.getDate()}`;
                            }}
                          />
                          <YAxis domain={[60, 100]} />
                          <Tooltip 
                            formatter={(value) => value ? [value, 'Accuracy %'] : ['No data', 'Accuracy %']}
                            labelFormatter={(label) => formatDate(label)}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="accuracy" 
                            stroke="#10B981" 
                            activeDot={{ r: 8 }} 
                            connectNulls={true}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="keys">
            <Card>
              <CardHeader>
                <CardTitle>Key Accuracy Analysis</CardTitle>
                <CardDescription>Keys with the lowest accuracy - focus on improving these</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-80 w-full flex items-center justify-center">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={keyPerformance}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="key" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="accuracy" name="Accuracy %" fill="#8884d8" />
                        <Bar dataKey="frequency" name="Frequency" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Recent Typing Tests</CardTitle>
                <CardDescription>Your most recent typing test results</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex justify-between">
                        <Skeleton className="h-6 w-24" />
                        <Skeleton className="h-6 w-32" />
                        <Skeleton className="h-6 w-32" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
                        <tr>
                          <th scope="col" className="px-6 py-3">Date</th>
                          <th scope="col" className="px-6 py-3">WPM</th>
                          <th scope="col" className="px-6 py-3">Accuracy</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTests.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-6 py-4 text-center">No recent tests found</td>
                          </tr>
                        ) : (
                          recentTests.map((test, index) => (
                            <tr key={index} className="bg-white border-b dark:bg-gray-900 dark:border-gray-700">
                              <td className="px-6 py-4">{formatDate(test.date)}</td>
                              <td className="px-6 py-4 font-medium">{test.speed} WPM</td>
                              <td className="px-6 py-4">{test.accuracy.toFixed(2)}%</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <Card>
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>Milestones you've reached in your typing journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Speed achievements */}
                  <div className={`p-4 border rounded-lg ${peakWPM >= 60 ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50'}`}>
                    <div className="flex items-center">
                      <Award className={`h-6 w-6 mr-2 ${peakWPM >= 60 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                      <span className="font-medium">Speed Demon</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reach 60 WPM</p>
                    {peakWPM >= 60 && (
                      <div className="text-xs mt-2 text-blue-600 dark:text-blue-400">Achieved! Your best: {peakWPM} WPM</div>
                    )}
                  </div>
                  
                  <div className={`p-4 border rounded-lg ${peakWPM >= 80 ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50'}`}>
                    <div className="flex items-center">
                      <Award className={`h-6 w-6 mr-2 ${peakWPM >= 80 ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                      <span className="font-medium">Lightning Fingers</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reach 80 WPM</p>
                    {peakWPM >= 80 && (
                      <div className="text-xs mt-2 text-indigo-600 dark:text-indigo-400">Achieved! Your best: {peakWPM} WPM</div>
                    )}
                  </div>
                  
                  <div className={`p-4 border rounded-lg ${peakWPM >= 100 ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50'}`}>
                    <div className="flex items-center">
                      <Award className={`h-6 w-6 mr-2 ${peakWPM >= 100 ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                      <span className="font-medium">Speed Master</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Reach 100 WPM</p>
                    {peakWPM >= 100 && (
                      <div className="text-xs mt-2 text-purple-600 dark:text-purple-400">Achieved! Your best: {peakWPM} WPM</div>
                    )}
                  </div>
                  
                  {/* Accuracy achievements */}
                  <div className={`p-4 border rounded-lg ${averageAccuracy >= 95 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50'}`}>
                    <div className="flex items-center">
                      <Award className={`h-6 w-6 mr-2 ${averageAccuracy >= 95 ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                      <span className="font-medium">Precision Typer</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Achieve 95% accuracy</p>
                    {averageAccuracy >= 95 && (
                      <div className="text-xs mt-2 text-green-600 dark:text-green-400">Achieved! Your accuracy: {averageAccuracy}%</div>
                    )}
                  </div>
                  
                  {/* Test count achievements */}
                  <div className={`p-4 border rounded-lg ${totalTests >= 10 ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50'}`}>
                    <div className="flex items-center">
                      <BarChartIcon className={`h-6 w-6 mr-2 ${totalTests >= 10 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'}`} />
                      <span className="font-medium">Dedicated Typist</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete 10 typing tests</p>
                    {totalTests >= 10 && (
                      <div className="text-xs mt-2 text-amber-600 dark:text-amber-400">Achieved! Tests completed: {totalTests}</div>
                    )}
                  </div>
                  
                  <div className={`p-4 border rounded-lg ${totalTests >= 50 ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50'}`}>
                    <div className="flex items-center">
                      <BarChartIcon className={`h-6 w-6 mr-2 ${totalTests >= 50 ? 'text-orange-600 dark:text-orange-400' : 'text-gray-400'}`} />
                      <span className="font-medium">Typing Enthusiast</span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete 50 typing tests</p>
                    {totalTests >= 50 && (
                      <div className="text-xs mt-2 text-orange-600 dark:text-orange-400">Achieved! Tests completed: {totalTests}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 