"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HexColorPicker } from "react-colorful";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useStore";
import { Crown } from "lucide-react";

interface ThemeColors {
  background: string;
  text: string;
  cursor: string;
  correct: string;
  incorrect: string;
  currentWord: string;
}

const defaultThemes: Record<string, ThemeColors> = {
  dark: {
    background: "#1E1E2E",
    text: "#CDD6F4",
    cursor: "#F5E0DC",
    correct: "#A6E3A1",
    incorrect: "#F38BA8",
    currentWord: "#89B4FA",
  },
  light: {
    background: "#F8F9FA",
    text: "#212529",
    cursor: "#FD7E14",
    correct: "#28A745",
    incorrect: "#DC3545",
    currentWord: "#007BFF",
  },
  sunset: {
    background: "#282C35",
    text: "#F8F8F2",
    cursor: "#FF79C6",
    correct: "#50FA7B",
    incorrect: "#FF5555",
    currentWord: "#BD93F9",
  },
  ocean: {
    background: "#0A192F",
    text: "#E6F1FF",
    cursor: "#64FFDA",
    correct: "#8892B0",
    incorrect: "#FF6E6C",
    currentWord: "#5CCFE6",
  },
};

export default function ThemesPage() {
  const [selectedTheme, setSelectedTheme] = useState<string>("dark");
  const [customTheme, setCustomTheme] = useState<ThemeColors>(defaultThemes.dark);
  const [selectedColor, setSelectedColor] = useState<keyof ThemeColors>("background");
  const [savedThemes, setSavedThemes] = useState<Record<string, ThemeColors>>({});
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const router = useRouter();
  const { isPremium } = useAuthStore();

  useEffect(() => {
    // Check premium status
    if (!isPremium) {
      router.push("/subscription");
      return;
    }
    setIsPremiumUser(true);

    // Load saved themes from localStorage
    const themes = localStorage.getItem("customThemes");
    if (themes) {
      try {
        setSavedThemes(JSON.parse(themes));
      } catch (e) {
        console.error("Error loading saved themes", e);
      }
    }
  }, [isPremium, router]);

  const handleSelectTheme = (theme: string) => {
    setSelectedTheme(theme);
    if (theme in defaultThemes) {
      setCustomTheme(defaultThemes[theme]);
    } else if (theme in savedThemes) {
      setCustomTheme(savedThemes[theme]);
    }
  };

  const handleColorChange = (color: string) => {
    setCustomTheme({
      ...customTheme,
      [selectedColor]: color,
    });
  };

  const saveCustomTheme = () => {
    const themeName = prompt("Enter a name for your custom theme:", "My Custom Theme");
    if (!themeName) return;

    const updatedThemes = {
      ...savedThemes,
      [themeName]: customTheme,
    };

    setSavedThemes(updatedThemes);
    localStorage.setItem("customThemes", JSON.stringify(updatedThemes));
    setSelectedTheme(themeName);
  };

  const applyTheme = () => {
    localStorage.setItem("activeTheme", JSON.stringify(customTheme));
    alert("Theme applied! It will be used in your next typing test.");
  };

  // If not premium, don't render the content
  if (!isPremiumUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-8">
          <Crown className="h-8 w-8 mr-3 text-yellow-500" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Premium Theme Customization
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Select Theme</CardTitle>
                <CardDescription>Choose a preset or your custom theme</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="presets" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="presets" className="flex-1">Presets</TabsTrigger>
                    <TabsTrigger value="custom" className="flex-1">Your Themes</TabsTrigger>
                  </TabsList>
                  <TabsContent value="presets" className="mt-4 space-y-2">
                    {Object.keys(defaultThemes).map((theme) => (
                      <Button
                        key={theme}
                        variant={selectedTheme === theme ? "default" : "outline"}
                        className="w-full justify-start mb-2"
                        onClick={() => handleSelectTheme(theme)}
                      >
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: defaultThemes[theme].background }}
                        />
                        {theme.charAt(0).toUpperCase() + theme.slice(1)}
                      </Button>
                    ))}
                  </TabsContent>
                  <TabsContent value="custom" className="mt-4">
                    {Object.keys(savedThemes).length > 0 ? (
                      <div className="space-y-2">
                        {Object.keys(savedThemes).map((theme) => (
                          <Button
                            key={theme}
                            variant={selectedTheme === theme ? "default" : "outline"}
                            className="w-full justify-start mb-2"
                            onClick={() => handleSelectTheme(theme)}
                          >
                            <div
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: savedThemes[theme].background }}
                            />
                            {theme}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No custom themes yet. Customize and save one!
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Theme Editor</CardTitle>
                <CardDescription>Customize your typing experience</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-6">
                      <Label>Color Property</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                        {Object.keys(customTheme).map((color) => (
                          <Button
                            key={color}
                            variant="outline"
                            className={`justify-start ${selectedColor === color ? "ring-2 ring-blue-500" : ""}`}
                            onClick={() => setSelectedColor(color as keyof ThemeColors)}
                          >
                            <div
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: customTheme[color as keyof ThemeColors] }}
                            />
                            {color.charAt(0).toUpperCase() + color.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Color Picker</Label>
                      <div className="mt-2">
                        <HexColorPicker
                          color={customTheme[selectedColor]}
                          onChange={handleColorChange}
                          className="w-full"
                        />
                      </div>
                      <div className="mt-2 font-mono text-sm">
                        {customTheme[selectedColor]}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Preview</Label>
                    <div
                      className="mt-2 p-6 rounded-lg h-40 overflow-hidden"
                      style={{ backgroundColor: customTheme.background }}
                    >
                      <div className="typing-test-preview">
                        <span style={{ color: customTheme.correct }}>The quick brown fox </span>
                        <span style={{ color: customTheme.currentWord, textDecoration: "underline" }}>jumps </span>
                        <span style={{ color: customTheme.text }}>over the lazy dog. </span>
                        <span style={{ color: customTheme.incorrect }}>Typing errors look like this. </span>
                        <span
                          style={{
                            backgroundColor: customTheme.cursor,
                            color: customTheme.background,
                            padding: "0 2px",
                          }}
                        >
                          |
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={saveCustomTheme} className="font-medium">
                  Save Theme
                </Button>
                <Button onClick={applyTheme} variant="premium" className="font-medium">Apply Theme</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 