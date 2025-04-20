"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Trophy, Target, AlertTriangle, Sun, Moon } from 'lucide-react'
import sampleParagraphs from '@/data/sampleParagraphs'
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { useSearchParams, useRouter } from "next/navigation"
import useAuthStore from "@/store/useStore"
import { useTheme } from "next-themes"

interface ThemeColors {
  background: string;
  text: string;
  cursor: string;
  correct: string;
  incorrect: string;
  currentWord: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: "speed" | "accuracy" | "endurance" | "precision" | "code";
  target: number;
  reward: string;
  content?: string;
}

// Default time options
const TIME_OPTIONS = [15, 30, 60];
const DEFAULT_TIME = 60;
const CHARS_PER_PAGE = 250; // Number of characters to show at once

// Light mode standard theme (for non-premium users)
const standardLightTheme: ThemeColors = {
  background: "#ffffff",
  text: "#4a5568",
  cursor: "#3182ce",
  correct: "#2563eb", // Blue for correct text
  incorrect: "#dc2626", // Red for wrong text
  currentWord: "#805ad5",
}

// Dark mode standard theme (for non-premium users)
const standardDarkTheme: ThemeColors = {
  background: "#09090b", // Updated to match website's dark background
  text: "#CDD6F4",
  cursor: "#F5E0DC",
  correct: "#2563eb", // Blue for correct text
  incorrect: "#dc2626", // Red for wrong text
  currentWord: "#89B4FA",
}

// Premium light theme (default for light mode when premium user hasn't selected a theme)
const premiumLightTheme: ThemeColors = {
  background: "#ffffff",
  text: "#4a5568",
  cursor: "#3182ce",
  correct: "#2563eb", // Blue for correct text
  incorrect: "#dc2626", // Red for wrong text
  currentWord: "#805ad5",
}

// Premium dark theme (default for dark mode when premium user hasn't selected a theme)
const premiumDarkTheme: ThemeColors = {
  background: "#09090b", // Updated to match website's dark background
  text: "#CDD6F4",
  cursor: "#F5E0DC",
  correct: "#2563eb", // Blue for correct text
  incorrect: "#dc2626", // Red for wrong text
  currentWord: "#89B4FA",
}

export default function TypingTest() {
  const [timeLeft, setTimeLeft] = useState<number>(DEFAULT_TIME)
  const [selectedTime, setSelectedTime] = useState<number>(DEFAULT_TIME)
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false)
  const [hasStarted, setHasStarted] = useState<boolean>(false)
  const [typedText, setTypedText] = useState<string>("")
  const [fullText, setFullText] = useState<string>("")
  const [visibleText, setVisibleText] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [accuracy, setAccuracy] = useState<number>(100)
  const [wpm, setWpm] = useState<number>(0)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const [theme, setTheme] = useState<ThemeColors>(standardLightTheme) // Default to standard light theme
  const [testTitle, setTestTitle] = useState<string>("")
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(null)
  const [isChallengeCompleted, setIsChallengeCompleted] = useState<boolean>(false)
  const [challengeMode, setChallengeMode] = useState<boolean>(false)
  const [customMode, setCustomMode] = useState<boolean>(false)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isPremium } = useAuthStore()
  const { theme: systemTheme } = useTheme()

  // Set up custom mode, themes, or challenges based on URL params
  useEffect(() => {
    const mode = searchParams.get("mode")
    
    // Set default theme based on system theme and premium status
    const defaultSystemTheme = systemTheme === 'dark' 
      ? (isPremium ? premiumDarkTheme : standardDarkTheme)
      : (isPremium ? premiumLightTheme : standardLightTheme);
    
    // Load custom theme if user has one and is premium
    const savedTheme = localStorage.getItem("activeTheme")
    if (savedTheme && isPremium) {
      try {
        setTheme(JSON.parse(savedTheme))
      } catch (e) {
        console.error("Error loading custom theme", e)
        setTheme(defaultSystemTheme)
      }
    } else {
      // Use default theme based on system preference and premium status
      setTheme(defaultSystemTheme)
    }

    if (mode === "custom" && isPremium) {
      // Load custom text
      const customText = localStorage.getItem("activeCustomText")
      if (customText) {
        try {
          const parsedText = JSON.parse(customText)
          setFullText(parsedText.content)
          setTestTitle(parsedText.title)
          setCustomMode(true)
        } catch (e) {
          console.error("Error loading custom text", e)
          selectRandomSampleText()
        }
      } else {
        selectRandomSampleText()
      }
    } else if (mode === "challenge" && isPremium) {
      // Load challenge
      const challenge = localStorage.getItem("activeChallenge")
      if (challenge) {
        try {
          const parsedChallenge = JSON.parse(challenge)
          setActiveChallenge(parsedChallenge)
          setChallengeMode(true)
          
          // Set time based on challenge type
          if (parsedChallenge.type === "endurance") {
            const challengeTimeInSeconds = parsedChallenge.target * 60; // Convert minutes to seconds
            setTimeLeft(challengeTimeInSeconds)
            setSelectedTime(challengeTimeInSeconds)
          }
          
          // Set challenge content if available, otherwise use random text
          if (parsedChallenge.content) {
            setFullText(parsedChallenge.content)
            setTestTitle(parsedChallenge.title)
          } else {
            selectRandomSampleText()
          }
        } catch (e) {
          console.error("Error loading challenge", e)
          selectRandomSampleText()
        }
      } else {
        selectRandomSampleText()
      }
    } else {
      selectRandomSampleText()
    }

    if (textAreaRef.current) {
      textAreaRef.current.focus()
    }
  }, [searchParams, isPremium, systemTheme])

  // Update visible text when fullText changes or page changes
  useEffect(() => {
    if (fullText) {
      const startIndex = currentPage * CHARS_PER_PAGE;
      const endIndex = Math.min(startIndex + CHARS_PER_PAGE, fullText.length);
      setVisibleText(fullText.substring(startIndex, endIndex));
    }
  }, [fullText, currentPage]);

  // Listen for system theme changes
  useEffect(() => {
    if (!isPremium || (isPremium && !localStorage.getItem("activeTheme"))) {
      // Update theme for non-premium users or premium users who haven't set a custom theme
      setTheme(systemTheme === 'dark' 
        ? (isPremium ? premiumDarkTheme : standardDarkTheme)
        : (isPremium ? premiumLightTheme : standardLightTheme)
      )
    }
  }, [systemTheme, isPremium])

  // Select random sample text
  const selectRandomSampleText = (): void => {
    const randomIndex = Math.floor(Math.random() * sampleParagraphs.paragraphs.length)
    setFullText(sampleParagraphs.paragraphs[randomIndex].text)
  }

  // Timer logic
  useEffect(() => {
    if (isTestRunning && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && isTestRunning) {
      setIsTestRunning(false)
      setIsDialogOpen(true)
      
      // Check if challenge is completed
      if (challengeMode && activeChallenge) {
        checkChallengeCompletion()
      }
    }
  }, [isTestRunning, timeLeft, challengeMode, activeChallenge])

  // Handle time option selection
  const handleTimeSelection = (time: number): void => {
    if (!isTestRunning && !hasStarted) {
      setSelectedTime(time)
      setTimeLeft(time)
    }
  }

  // Typing handler
  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    const typed = e.target.value
    
    // Check if we need to paginate to the next text chunk
    const currentVisibleTextLength = visibleText.length;
    if (typed.length >= currentVisibleTextLength && currentPage * CHARS_PER_PAGE + currentVisibleTextLength < fullText.length) {
      // User has typed all visible text, show next chunk
      setCurrentPage(prevPage => prevPage + 1);
      setTypedText(typed);
      return;
    }
    
    // Don't allow typing more than the visible text length
    if (typed.length > visibleText.length) return;

    // Start the test on first keystroke
    if (!hasStarted && typed.length > 0) {
      setHasStarted(true)
      setIsTestRunning(true)
    }

    setTypedText(typed)

    const charactersTyped = typed.length
    const correctChars = visibleText.substring(0, charactersTyped)

    let correctCount = 0
    for (let i = 0; i < charactersTyped; i++) {
      if (typed[i] === correctChars[i]) {
        correctCount++
      }
    }

    const accuracyValue = charactersTyped > 0 ? (correctCount / charactersTyped) * 100 : 100
    setAccuracy(accuracyValue)

    // Calculate WPM based on all text typed so far
    const totalTypedText = fullText.substring(0, currentPage * CHARS_PER_PAGE) + typed;
    const words = totalTypedText.trim().split(/\s+/).filter((word) => word.length > 0)
    const wpmValue = timeLeft < selectedTime ? (words.length / ((selectedTime - timeLeft) / 60)) : 0
    setWpm(Math.round(wpmValue))

    // Check if user has completed the full text
    const isLastPage = (currentPage + 1) * CHARS_PER_PAGE >= fullText.length;
    if (isLastPage && typed === visibleText) {
      // Stop the test if text is completed
      setIsTestRunning(false)
      setIsDialogOpen(true)
      
      // Check if challenge is completed
      if (challengeMode && activeChallenge) {
        checkChallengeCompletion()
      }
    }
  }

  // Check if challenge is completed
  const checkChallengeCompletion = (): void => {
    if (!activeChallenge) return
    
    let isCompleted = false
    
    switch (activeChallenge.type) {
      case "speed":
        isCompleted = wpm >= activeChallenge.target
        break
      case "accuracy":
        isCompleted = accuracy >= activeChallenge.target
        break
      case "endurance":
        // For endurance, just completing the test is a success
        isCompleted = true
        break
      case "precision":
        // Precision challenges need both good accuracy and speed
        isCompleted = accuracy >= activeChallenge.target
        break
      case "code":
        // Code challenges focus on accuracy
        isCompleted = accuracy >= activeChallenge.target
        break
    }
    
    setIsChallengeCompleted(isCompleted)
    
    // Store challenge completion in localStorage for stats
    if (isCompleted) {
      const completedChallenges = localStorage.getItem("completedChallenges")
      const challenges = completedChallenges ? JSON.parse(completedChallenges) : []
      challenges.push({
        ...activeChallenge,
        completedAt: new Date().toISOString(),
      })
      localStorage.setItem("completedChallenges", JSON.stringify(challenges))
    }
  }

  // Store results when dialog is displayed
  useEffect(() => {
    if (!isTestRunning && hasStarted && typedText.length > 0) {
      const storeResult = async () => {
        try {
          const response = await axios.put('/api/store-result', { speed: wpm, accuracy });
          console.log('Result stored:', response.data);
          toast.success("Result stored successfully")
        } catch (error) {
          toast.error("Failed to store result")
          console.log('Error while storing the result')
        }
      }
      storeResult();
    }
  }, [isTestRunning, hasStarted, typedText.length, wpm, accuracy])

  // Reset function
  const handleReset = () => {
    window.location.reload()
  }

  // Return to challenges page
  const goToChallenges = () => {
    router.push("/premium/challenges")
  }

  // Calculate progress through the entire text
  const overallProgress = Math.min(
    ((currentPage * CHARS_PER_PAGE) + typedText.length) / fullText.length * 100, 
    100
  );

  return (
    <div className="container min-h-screen mx-auto px-6 py-8">
      <Card className="border-none" style={{ backgroundColor: theme.background }}>
        <CardContent>
          {(!isDialogOpen) && (
            <div className="space-y-6">
              <div className="flex items-center justify-between text-lg font-medium">
                <div className="flex items-center space-x-3">
                  <Clock className="w-8 h-8" style={{ color: theme.text }} />
                  <span className="text-3xl" style={{ color: theme.text }}>
                    {hasStarted ? `${timeLeft}s` : 'Start typing to begin'}
                  </span>
                </div>

                {/* Time options */}
                {!hasStarted && !challengeMode && (
                  <div className="flex items-center space-x-2">
                    {TIME_OPTIONS.map(time => (
                      <Button
                        key={time}
                        onClick={() => handleTimeSelection(time)}
                        variant={selectedTime === time ? "premium" : "outline"}
                        className="px-3 py-1 h-8"
                      >
                        {time}s
                      </Button>
                    ))}
                  </div>
                )}
                
                {(challengeMode && activeChallenge) && (
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-6 h-6 text-blue-500" />
                    <span className="font-bold" style={{ color: theme.text }}>
                      Challenge: {activeChallenge.title}
                    </span>
                    <div className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold ml-2">
                      Target: {activeChallenge.type === "speed" 
                        ? `${activeChallenge.target} WPM` 
                        : activeChallenge.type === "accuracy" 
                          ? `${activeChallenge.target}% Accuracy` 
                          : activeChallenge.type === "endurance" 
                            ? `${activeChallenge.target} minutes` 
                            : activeChallenge.type === "code"
                              ? `${activeChallenge.target}% Accuracy`
                              : `${activeChallenge.target}% Precision`}
                    </div>
                  </div>
                )}
                
                {customMode && (
                  <div className="flex items-center space-x-2">
                    <span className="font-bold" style={{ color: theme.text }}>
                      Custom Text: {testTitle}
                    </span>
                  </div>
                )}
              </div>

              {/* Progress bar showing how much of the text has been completed */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-1 rounded-full transition-all duration-300 ease-in-out" 
                  style={{ width: `${overallProgress}%` }}
                />
              </div>

              <div className="relative min-h-[300px] w-full rounded-lg p-4 font-mono text-xl md:text-2xl"
                   style={{ backgroundColor: theme.background }}>
                <div
                  className="absolute inset-0 p-4 pointer-events-none whitespace-pre-wrap break-words leading-relaxed tracking-wide"
                  style={{ wordSpacing: "0.25em" }}
                  aria-hidden="true"
                >
                  {visibleText.split("").map((char, index) => (
                    <span
                      key={index}
                      style={
                        index < typedText.length
                          ? typedText[index] === char
                            ? { color: theme.correct }
                            : { color: theme.incorrect }
                          : { color: theme.text }
                      }
                    >
                      {char}
                    </span>
                  ))}
                </div>
                <textarea
                  ref={textAreaRef}
                  value={typedText}
                  onChange={handleTyping}
                  className="relative min-h-[300px] w-full text-transparent resize-none bg-transparent p-0 font-inherit leading-relaxed tracking-wide focus:outline-none focus:ring-0"
                  style={{ 
                    wordSpacing: "0.25em",
                    caretColor: theme.cursor
                  }}
                  placeholder=""
                  disabled={!isTestRunning && hasStarted}
                  onPaste={(e) => e.preventDefault()}
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>

              {/* Stats display */}
              <div className="flex justify-between text-sm" style={{ color: theme.text }}>
                <div>WPM: <span className="font-bold">{wpm}</span></div>
                <div>Accuracy: <span className="font-bold">{accuracy.toFixed(2)}%</span></div>
                <div>Progress: <span className="font-bold">{Math.round(overallProgress)}%</span></div>
              </div>
            </div>
          )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Typing Test Results</DialogTitle>
                <DialogDescription>Here's how you performed:</DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-xl mb-2">
                  Your WPM: <span className="font-bold">{wpm}</span>
                </p>
                <p className="text-xl mb-4">
                  Your Accuracy: <span className="font-bold">{accuracy.toFixed(2)}%</span>
                </p>
                
                {(challengeMode && activeChallenge) && (
                  <div className="mt-4 p-4 rounded-lg border">
                    <div className="flex items-center mb-2">
                      <Trophy className="w-6 h-6 mr-2 text-blue-500" />
                      <h3 className="text-lg font-bold">Challenge Results</h3>
                    </div>
                    
                    {isChallengeCompleted ? (
                      <div className="flex flex-col items-center text-center">
                        <div className="flex items-center text-blue-600 mb-2">
                          <Target className="w-6 h-6 mr-2" />
                          <span className="font-bold">Challenge Completed!</span>
                        </div>
                        <p>You've earned: {activeChallenge.reward}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-center">
                        <div className="flex items-center text-red-600 mb-2">
                          <AlertTriangle className="w-6 h-6 mr-2" />
                          <span className="font-bold">Challenge Failed</span>
                        </div>
                        <p>
                          Target: {activeChallenge.type === "speed" 
                            ? `${activeChallenge.target} WPM` 
                            : activeChallenge.type === "accuracy" 
                              ? `${activeChallenge.target}% Accuracy` 
                              : activeChallenge.type === "endurance" 
                                ? `${activeChallenge.target} minutes` 
                                : activeChallenge.type === "code"
                                  ? `${activeChallenge.target}% Accuracy`
                                  : `${activeChallenge.target}% Precision`}
                        </p>
                        <p>Try again! You can do it!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <DialogFooter className="flex flex-col sm:flex-row gap-2">
                {challengeMode && (
                  <Button onClick={goToChallenges} variant="outline">
                    Back to Challenges
                  </Button>
                )}
                <Button onClick={handleReset} variant="premium" className="font-medium">
                  Try Again
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
      <Toaster position="bottom-right" reverseOrder={false} />
    </div>
  )
}

