"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/useStore";
import { Crown, Trash2, Edit, Play, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CustomText {
  id: string;
  title: string;
  content: string;
  category: string;
  dateCreated: string;
}

export default function CustomTextsPage() {
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [customTexts, setCustomTexts] = useState<CustomText[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<"create" | "edit">("create");
  const router = useRouter();
  const { isPremium } = useAuthStore();

  useEffect(() => {
    // Check premium status
    if (!isPremium) {
      router.push("/subscription");
      return;
    }
    setIsPremiumUser(true);

    // Load saved custom texts from localStorage
    const savedTexts = localStorage.getItem("customTypingTexts");
    if (savedTexts) {
      try {
        setCustomTexts(JSON.parse(savedTexts));
      } catch (e) {
        console.error("Error loading saved texts", e);
      }
    } else {
      // If no saved texts, create a sample one
      const sampleTexts = [
        {
          id: "sample1",
          title: "Sample Text",
          content: "This is a sample custom text. You can create your own texts for typing practice.",
          category: "general",
          dateCreated: new Date().toISOString(),
        },
      ];
      setCustomTexts(sampleTexts);
      localStorage.setItem("customTypingTexts", JSON.stringify(sampleTexts));
    }
  }, [isPremium, router]);

  const openCreateDialog = () => {
    setTitle("");
    setContent("");
    setCategory("general");
    setEditingTextId(null);
    setDialogAction("create");
    setIsDialogOpen(true);
  };

  const openEditDialog = (text: CustomText) => {
    setTitle(text.title);
    setContent(text.content);
    setCategory(text.category);
    setEditingTextId(text.id);
    setDialogAction("edit");
    setIsDialogOpen(true);
  };

  const handleSaveText = () => {
    if (!title.trim() || !content.trim()) {
      alert("Please provide both a title and content for your typing text.");
      return;
    }

    let updatedTexts: CustomText[];

    if (dialogAction === "create") {
      // Create new text
      const newText: CustomText = {
        id: Date.now().toString(),
        title,
        content,
        category,
        dateCreated: new Date().toISOString(),
      };

      updatedTexts = [...customTexts, newText];
    } else {
      // Edit existing text
      updatedTexts = customTexts.map((text) =>
        text.id === editingTextId
          ? {
              ...text,
              title,
              content,
              category,
            }
          : text
      );
    }

    setCustomTexts(updatedTexts);
    localStorage.setItem("customTypingTexts", JSON.stringify(updatedTexts));
    setIsDialogOpen(false);
  };

  const handleDeleteText = (id: string) => {
    if (confirm("Are you sure you want to delete this custom text?")) {
      const updatedTexts = customTexts.filter((text) => text.id !== id);
      setCustomTexts(updatedTexts);
      localStorage.setItem("customTypingTexts", JSON.stringify(updatedTexts));
    }
  };

  const startTypingTest = (text: CustomText) => {
    // Store the selected text in localStorage
    localStorage.setItem("activeCustomText", JSON.stringify({
      content: text.content,
      title: text.title
    }));
    
    // Navigate to the playground with a custom parameter
    router.push("/playground?mode=custom");
  };

  // If not premium, don't render the content
  if (!isPremiumUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <Crown className="h-8 w-8 mr-3 text-yellow-500" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
              Custom Typing Texts
            </h1>
          </div>
          <Button onClick={openCreateDialog} variant="premium" className="flex items-center font-medium">
            <Plus className="mr-2 h-4 w-4" /> Create New
          </Button>
        </div>

        {customTexts.length === 0 ? (
          <Card className="mb-8">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                You haven't created any custom typing texts yet. Click the "Create New" button to get started!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {customTexts.map((text) => (
              <Card key={text.id} className="flex flex-col h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="mb-1">{text.title}</CardTitle>
                      <CardDescription>
                        {text.category} • {new Date(text.dateCreated).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(text)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteText(text.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{text.content}</p>
                </CardContent>
                <CardFooter className="mt-auto pt-4">
                  <Button
                    className="w-full font-medium"
                    variant="default"
                    onClick={() => startTypingTest(text)}
                  >
                    <Play className="mr-2 h-4 w-4" /> Practice with this text
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{dialogAction === "create" ? "Create New" : "Edit"} Custom Text</DialogTitle>
              <DialogDescription>
                Create your own custom typing texts for practice. Great for specific content you want to master.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="col-span-3"
                  placeholder="Give your text a descriptive title"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="general">General</option>
                  <option value="code">Programming</option>
                  <option value="technical">Technical</option>
                  <option value="quotes">Quotes</option>
                  <option value="essay">Essays</option>
                  <option value="poetry">Poetry</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="content" className="text-right">
                  Content
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="col-span-3"
                  placeholder="Type or paste the text content here..."
                  rows={8}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleSaveText} variant="premium" className="font-medium">
                {dialogAction === "create" ? "Create" : "Save"} Custom Text
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
} 