"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useStore";
import { Crown, Trophy, Calendar, Star, Clock, CheckCircle, Lock, Code } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import challengeContent from "@/data/challengeContent";

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  completed: boolean;
  dateUnlocked: string;
  type: "speed" | "accuracy" | "endurance" | "precision" | "code";
  target: number;
  reward: string;
  content?: string;
}

export default function ChallengesPage() {
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [dailyChallenges, setDailyChallenges] = useState<Challenge[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [totalCompleted, setTotalCompleted] = useState(0);
  const router = useRouter();
  const { isPremium } = useAuthStore();

  useEffect(() => {
    // Check premium status
    if (!isPremium) {
      router.push("/subscription");
      return;
    }
    setIsPremiumUser(true);

    // In a real app, you would fetch challenges from the server
    // Here we're generating mock data for demonstration
    generateMockChallenges();
    loadProgressData();
  }, [isPremium, router]);

  const generateMockChallenges = () => {
    const today = new Date();
    
    // Helper function to get random content based on challenge type
    const getRandomContent = (type: string, difficulty: string) => {
      let contentArray: any[] = [];
      
      switch(type) {
        case "speed":
          contentArray = challengeContent.speed;
          break;
        case "accuracy":
          contentArray = challengeContent.accuracy;
          break;
        case "endurance":
          contentArray = challengeContent.endurance;
          break;
        case "precision":
          contentArray = challengeContent.precision;
          break;
        case "code":
          contentArray = challengeContent.code;
          break;
        default:
          contentArray = challengeContent.speed;
      }
      
      // Filter by difficulty if available
      const filteredByDifficulty = contentArray.filter(item => 
        item.difficulty === difficulty || !difficulty
      );
      
      // Get random content
      const randomItem = filteredByDifficulty.length > 0 
        ? filteredByDifficulty[Math.floor(Math.random() * filteredByDifficulty.length)]
        : contentArray[Math.floor(Math.random() * contentArray.length)];
      
      return randomItem.content;
    };

    const challenges: Challenge[] = [
      {
        id: "daily-1",
        title: "Speed Demon",
        description: "Reach 80 WPM on a standard paragraph test",
        difficulty: "medium",
        completed: Math.random() > 0.5,
        dateUnlocked: today.toISOString(),
        type: "speed",
        target: 80,
        reward: "Speed Master Badge",
        content: getRandomContent("speed", "medium")
      },
      {
        id: "daily-2",
        title: "Accuracy Ace",
        description: "Complete a typing test with 98% accuracy or higher",
        difficulty: "hard",
        completed: false,
        dateUnlocked: today.toISOString(),
        type: "accuracy",
        target: 98,
        reward: "Precision Badge",
        content: getRandomContent("accuracy", "hard")
      },
      {
        id: "daily-3",
        title: "Marathon Typist",
        description: "Type continuously for 10 minutes without stopping",
        difficulty: "expert",
        completed: false,
        dateUnlocked: today.toISOString(),
        type: "endurance",
        target: 10,
        reward: "Endurance Trophy",
        content: getRandomContent("endurance", "expert")
      },
      {
        id: "weekly-1",
        title: "Code Ninja",
        description: "Type a complete JavaScript function with 95% accuracy",
        difficulty: "hard",
        completed: false,
        dateUnlocked: new Date(today.getTime() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
        type: "code",
        target: 95,
        reward: "Code Master Badge",
        content: getRandomContent("code", "hard")
      },
      {
        id: "weekly-2",
        title: "Words of Wisdom",
        description: "Type 5 famous quotes in under 3 minutes",
        difficulty: "medium",
        completed: true,
        dateUnlocked: new Date(today.getTime() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
        type: "speed",
        target: 3,
        reward: "15 XP Bonus",
        content: getRandomContent("speed", "medium")
      },
    ];

    setDailyChallenges(challenges);
  };

  const loadProgressData = () => {
    // In a real app, fetch this from the server
    // Here we're generating mock progress data
    setWeeklyProgress(Math.floor(Math.random() * 75) + 25); // 25-100%
    setStreakDays(Math.floor(Math.random() * 10) + 1); // 1-10 days
    setTotalCompleted(Math.floor(Math.random() * 50) + 5); // 5-55 challenges
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "hard":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      case "expert":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "speed":
        return <Clock className="h-4 w-4 mr-1" />;
      case "accuracy":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "endurance":
        return <Calendar className="h-4 w-4 mr-1" />;
      case "precision":
        return <Star className="h-4 w-4 mr-1" />;
      case "code":
        return <Code className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const startChallenge = (challenge: Challenge) => {
    // Store challenge in localStorage to be picked up by playground
    localStorage.setItem("activeChallenge", JSON.stringify(challenge));
    
    // Navigate to playground with challenge mode parameter
    router.push("/playground?mode=challenge");
  };

  const markChallengeComplete = (id: string) => {
    // In a real app, you would send this to the server
    const updatedChallenges = dailyChallenges.map(challenge => 
      challenge.id === id ? { ...challenge, completed: true } : challenge
    );
    
    setDailyChallenges(updatedChallenges);
    setTotalCompleted(prev => prev + 1);
    
    // Give user a reward notification
    const challenge = dailyChallenges.find(c => c.id === id);
    if (challenge) {
      alert(`Congratulations! You've earned: ${challenge.reward}`);
    }
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
            Daily Challenges
          </h1>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium">Weekly Progress</h3>
                <Badge variant="outline">{weeklyProgress}%</Badge>
              </div>
              <Progress value={weeklyProgress} className="h-2 mt-1" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {100 - weeklyProgress}% remaining to reach your weekly goal
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Current Streak</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Keep it going!
                </p>
              </div>
              <div className="flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-orange-500" />
                <span className="text-3xl font-bold">{streakDays}</span>
                <span className="ml-1 text-gray-500">days</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Challenges Completed</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Keep crushing your goals!
                </p>
              </div>
              <div className="flex items-center">
                <Trophy className="h-6 w-6 mr-2 text-yellow-500" />
                <span className="text-3xl font-bold">{totalCompleted}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Challenges */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Today's Challenges</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-10">
          {dailyChallenges
            .filter(challenge => new Date(challenge.dateUnlocked).toDateString() === new Date().toDateString())
            .map((challenge) => (
              <Card key={challenge.id} className={challenge.completed ? "opacity-75" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{challenge.title}</CardTitle>
                    <div className={getDifficultyColor(challenge.difficulty) + " px-2 py-1 rounded text-xs font-semibold"}>
                      {challenge.difficulty}
                    </div>
                  </div>
                  <CardDescription>{challenge.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {getTypeIcon(challenge.type)}
                    <span className="capitalize">{challenge.type} Challenge</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Star className="h-4 w-4 mr-1 text-yellow-500" />
                    <span>Reward: {challenge.reward}</span>
                  </div>
                  
                  {/* Preview of challenge content */}
                  {challenge.content && (
                    <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono overflow-hidden text-ellipsis line-clamp-2">
                      {challenge.type === "code" ? (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <Code className="h-3 w-3 mr-1" />
                          <span>JavaScript code snippet</span>
                        </div>
                      ) : (
                        challenge.content.substring(0, 100) + "..."
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {challenge.completed ? (
                    <Button className="w-full" variant="outline" disabled>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Completed
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => startChallenge(challenge)}>
                      Start Challenge
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
        </div>

        {/* Previous Challenges */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Previous Challenges</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dailyChallenges
            .filter(challenge => new Date(challenge.dateUnlocked).toDateString() !== new Date().toDateString())
            .map((challenge) => (
              <Card key={challenge.id} className={challenge.completed ? "opacity-75" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{challenge.title}</CardTitle>
                    <div className={getDifficultyColor(challenge.difficulty) + " px-2 py-1 rounded text-xs font-semibold"}>
                      {challenge.difficulty}
                    </div>
                  </div>
                  <CardDescription>
                    {challenge.description}
                    <div className="text-xs mt-1 text-gray-500">
                      Unlocked: {new Date(challenge.dateUnlocked).toLocaleDateString()}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    {getTypeIcon(challenge.type)}
                    <span className="capitalize">{challenge.type} Challenge</span>
                  </div>
                  
                  {/* Preview of challenge content */}
                  {challenge.content && (
                    <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs font-mono overflow-hidden text-ellipsis line-clamp-2">
                      {challenge.type === "code" ? (
                        <div className="flex items-center text-green-600 dark:text-green-400">
                          <Code className="h-3 w-3 mr-1" />
                          <span>JavaScript code snippet</span>
                        </div>
                      ) : (
                        challenge.content.substring(0, 100) + "..."
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  {challenge.completed ? (
                    <Button className="w-full" variant="outline" disabled>
                      <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                      Completed
                    </Button>
                  ) : (
                    <Button className="w-full" onClick={() => startChallenge(challenge)}>
                      Try Challenge
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
} 