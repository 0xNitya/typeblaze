'use client';

import { useEffect, useState } from 'react';
import { patterns } from '@/data/pattern';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/useStore';
import { Crown, Filter, Search, ExternalLink, BookOpen, Save, RotateCw } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

export default function LeetCodePatterns() {
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [filterPattern, setFilterPattern] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPatterns, setSelectedPatterns] = useState<string[]>([]);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState<boolean>(false);
  const [isStatisticsDialogOpen, setIsStatisticsDialogOpen] = useState<boolean>(false);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  
  const router = useRouter();
  const { isPremium } = useAuthStore();

  useEffect(() => {
    // Check premium status
    if (!isPremium) {
      router.push("/subscription");
      return;
    }
    setIsPremiumUser(true);

    // Load completed questions from local storage
    const storedCompleted = getFromLocalStorage('leetcodeCompletedQuestions');
    if (storedCompleted) {
      setCompletedQuestions(new Set(storedCompleted));
    }

    // Load notes from local storage
    const storedNotes = getFromLocalStorage('leetcodeQuestionNotes');
    if (storedNotes) {
      setNotes(storedNotes);
    }

    // Load selected patterns
    const storedPatterns = getFromLocalStorage('leetcodeSelectedPatterns');
    if (storedPatterns) {
      setSelectedPatterns(storedPatterns);
    }
  }, [isPremium, router]);

  const uniquePatterns = [...new Set(patterns.map(q => q.pattern))];
  const totalQuestions = patterns.length;
  const completedCount = completedQuestions.size;
  const completionPercentage = Math.round((completedCount / totalQuestions) * 100);

  const handleCheckQuestion = (id: string) => {
    const newCompleted = new Set(completedQuestions);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedQuestions(newCompleted);
    saveToLocalStorage('leetcodeCompletedQuestions', [...newCompleted]);
    
    // Update last saved timestamp
    const timestamp = new Date().toLocaleString();
    setLastSaved(timestamp);
  };

  const handleNoteChange = (id: string, note: string) => {
    const newNotes = { ...notes, [id]: note };
    setNotes(newNotes);
    saveToLocalStorage('leetcodeQuestionNotes', newNotes);
    
    // Update last saved timestamp
    const timestamp = new Date().toLocaleString();
    setLastSaved(timestamp);
  };

  const togglePatternFilter = (pattern: string) => {
    const newPatterns = selectedPatterns.includes(pattern)
      ? selectedPatterns.filter(p => p !== pattern)
      : [...selectedPatterns, pattern];
    
    setSelectedPatterns(newPatterns);
    saveToLocalStorage('leetcodeSelectedPatterns', newPatterns);
  };

  const clearFilters = () => {
    setSelectedPatterns([]);
    setSearchQuery('');
    setFilterPattern('');
    saveToLocalStorage('leetcodeSelectedPatterns', []);
  };

  const filteredQuestions = patterns.filter(question => {
    // Apply pattern filter
    if (selectedPatterns.length > 0 && !selectedPatterns.includes(question.pattern)) {
      return false;
    }
    
    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        question.title.toLowerCase().includes(query) ||
        question.pattern.toLowerCase().includes(query) ||
        (notes[question.id] && notes[question.id].toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  // Get pattern statistics
  const patternStats = uniquePatterns.map(pattern => {
    const questionsInPattern = patterns.filter(q => q.pattern === pattern);
    const completedInPattern = questionsInPattern.filter(q => completedQuestions.has(q.id));
    
    return {
      pattern,
      total: questionsInPattern.length,
      completed: completedInPattern.length,
      percentage: Math.round((completedInPattern.length / questionsInPattern.length) * 100)
    };
  }).sort((a, b) => b.percentage - a.percentage);

  const saveToLocalStorage = (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  };
  
  const getFromLocalStorage = (key: string) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  };

  const resetProgress = () => {
    if (confirm("Are you sure you want to reset all your progress? This cannot be undone.")) {
      setCompletedQuestions(new Set());
      setNotes({});
      saveToLocalStorage('leetcodeCompletedQuestions', []);
      saveToLocalStorage('leetcodeQuestionNotes', {});
      
      // Update last saved timestamp
      const timestamp = new Date().toLocaleString();
      setLastSaved(timestamp);
    }
  };

  // If not premium, don't render the content
  if (!isPremiumUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-background p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Crown className="h-8 w-8 mr-3 text-yellow-500" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            LeetCode Patterns Tracker
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="col-span-1">
            <CardHeader className="pb-2">
              <CardTitle>Progress</CardTitle>
              <CardDescription>Your LeetCode journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span>Completion:</span>
                  <Badge variant="outline" className="font-semibold">
                    {completedCount} / {totalQuestions}
                  </Badge>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span>Patterns:</span>
                  <Badge variant="outline">
                    {uniquePatterns.length} Patterns
                  </Badge>
                </div>

                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsStatisticsDialogOpen(true)}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Statistics
                  </Button>
                </div>

                {lastSaved && (
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Last saved: {lastSaved}
                  </div>
                )}

                <div className="mt-4">
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full"
                    onClick={resetProgress}
                  >
                    <RotateCw className="w-4 h-4 mr-2" />
                    Reset Progress
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1 md:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle>Questions Filter</CardTitle>
              <CardDescription>Find questions by pattern or keyword</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="col-span-1 md:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder="Search questions, patterns, or notes..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-span-1">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsFilterDialogOpen(true)}
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter by Pattern
                    {selectedPatterns.length > 0 && (
                      <Badge className="ml-2 bg-blue-500 text-white">{selectedPatterns.length}</Badge>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="w-full">
          <CardContent className="p-4">
            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Questions</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="remaining">Remaining</TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                <QuestionTable 
                  questions={filteredQuestions}
                  completedQuestions={completedQuestions}
                  notes={notes}
                  handleCheckQuestion={handleCheckQuestion}
                  handleNoteChange={handleNoteChange}
                />
              </TabsContent>
              
              <TabsContent value="completed">
                <QuestionTable 
                  questions={filteredQuestions.filter(q => completedQuestions.has(q.id))}
                  completedQuestions={completedQuestions}
                  notes={notes}
                  handleCheckQuestion={handleCheckQuestion}
                  handleNoteChange={handleNoteChange}
                />
              </TabsContent>
              
              <TabsContent value="remaining">
                <QuestionTable 
                  questions={filteredQuestions.filter(q => !completedQuestions.has(q.id))}
                  completedQuestions={completedQuestions}
                  notes={notes}
                  handleCheckQuestion={handleCheckQuestion}
                  handleNoteChange={handleNoteChange}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Pattern Filter Dialog */}
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Filter by Pattern</DialogTitle>
              <DialogDescription>
                Select one or more patterns to filter the questions.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-2">
              {uniquePatterns.map((pattern) => (
                <div key={pattern} className="flex items-center space-x-2">
                  <Checkbox 
                    id={`pattern-${pattern}`}
                    checked={selectedPatterns.includes(pattern)}
                    onCheckedChange={() => togglePatternFilter(pattern)}
                  />
                  <label
                    htmlFor={`pattern-${pattern}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {pattern} ({patterns.filter(q => q.pattern === pattern).length})
                  </label>
                </div>
              ))}
            </div>
            <DialogFooter className="flex justify-between">
              <Button variant="outline" onClick={clearFilters}>
                Clear All
              </Button>
              <Button onClick={() => setIsFilterDialogOpen(false)}>
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Statistics Dialog */}
        <Dialog open={isStatisticsDialogOpen} onOpenChange={setIsStatisticsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Pattern Statistics</DialogTitle>
              <DialogDescription>
                Your progress by pattern category
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pattern</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patternStats.map((stat) => (
                    <TableRow key={stat.pattern}>
                      <TableCell>{stat.pattern}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                stat.percentage >= 80 ? 'bg-green-500' : 
                                stat.percentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${stat.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs whitespace-nowrap">
                            {stat.completed}/{stat.total}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Separate component for the question table
function QuestionTable({ 
  questions, 
  completedQuestions, 
  notes, 
  handleCheckQuestion, 
  handleNoteChange 
}: { 
  questions: any[],
  completedQuestions: Set<string>,
  notes: Record<string, string>,
  handleCheckQuestion: (id: string) => void,
  handleNoteChange: (id: string, note: string) => void
}) {
  if (questions.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>No questions match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">Done</TableHead>
            <TableHead>Question</TableHead>
            <TableHead>Pattern</TableHead>
            <TableHead className="w-[40%]">Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => (
            <TableRow key={question.id}>
              <TableCell>
                <Checkbox
                  checked={completedQuestions.has(question.id)}
                  onCheckedChange={() => handleCheckQuestion(question.id)}
                />
              </TableCell>
              <TableCell>
                <a
                  href={question.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center"
                >
                  {question.title}
                  <ExternalLink className="ml-1 h-3 w-3" />
                </a>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{question.pattern}</Badge>
              </TableCell>
              <TableCell>
                <Input
                  className="w-full text-sm"
                  placeholder="Add notes..."
                  value={notes[question.id] || ''}
                  onChange={(e) => handleNoteChange(question.id, e.target.value)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 