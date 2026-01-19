import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Code, Lightbulb, CheckCircle2, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { useGetKnowledgeSummaries, useAddKnowledgeSummary, useUpdateLearningProgress, useGetLearningProgress } from '../hooks/useQueries';

const learningModules = [
  {
    id: 'js-basics',
    title: 'JavaScript Basics',
    description: 'Learn the fundamentals of JavaScript programming',
    content: `# JavaScript Basics

## Variables
JavaScript has three ways to declare variables:
- \`let\`: Block-scoped, can be reassigned
- \`const\`: Block-scoped, cannot be reassigned
- \`var\`: Function-scoped (legacy)

## Data Types
- String: "Hello World"
- Number: 42, 3.14
- Boolean: true, false
- Array: [1, 2, 3]
- Object: { key: "value" }

## Functions
\`\`\`javascript
function greet(name) {
  return "Hello, " + name;
}
\`\`\``,
  },
  {
    id: 'react-intro',
    title: 'Introduction to React',
    description: 'Understanding React components and hooks',
    content: `# Introduction to React

## Components
React apps are built using components - reusable pieces of UI.

## Hooks
- \`useState\`: Manage component state
- \`useEffect\`: Handle side effects
- \`useContext\`: Share data across components

## Example
\`\`\`jsx
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
\`\`\``,
  },
  {
    id: 'algorithms',
    title: 'Algorithm Basics',
    description: 'Common algorithms and problem-solving techniques',
    content: `# Algorithm Basics

## Big O Notation
Describes algorithm efficiency:
- O(1): Constant time
- O(n): Linear time
- O(n²): Quadratic time

## Common Patterns
- Two Pointers
- Sliding Window
- Recursion
- Dynamic Programming

## Example: Binary Search
\`\`\`javascript
function binarySearch(arr, target) {
  let left = 0, right = arr.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
\`\`\``,
  },
];

export default function LearningZone() {
  const [selectedModule, setSelectedModule] = useState(learningModules[0]);
  const { data: knowledgeSummaries = [] } = useGetKnowledgeSummaries();
  const addKnowledgeSummary = useAddKnowledgeSummary();
  const updateProgress = useUpdateLearningProgress();
  const { data: learningProgress } = useGetLearningProgress();

  const completedModules = learningProgress?.completedModules || [];
  const isModuleCompleted = (moduleId: string) => completedModules.includes(moduleId);

  const handleCompleteModule = async (moduleId: string) => {
    if (isModuleCompleted(moduleId)) {
      toast.info('Module already completed!');
      return;
    }

    const newCompletedModules = [...completedModules, moduleId];
    const badges = learningProgress?.badges || [];
    
    if (newCompletedModules.length === 1) {
      badges.push('First Steps');
    } else if (newCompletedModules.length === 3) {
      badges.push('Quick Learner');
    } else if (newCompletedModules.length === learningModules.length) {
      badges.push('Master Student');
    }

    try {
      await updateProgress.mutateAsync({
        completedModules: newCompletedModules,
        badges,
      });
      toast.success('🎉 Module completed!');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleSaveSummary = async () => {
    try {
      await addKnowledgeSummary.mutateAsync({
        topic: selectedModule.title,
        content: selectedModule.content,
      });
      toast.success('Summary saved!');
    } catch (error) {
      toast.error('Failed to save summary');
    }
  };

  return (
    <div className="h-full flex">
      <div className="w-80 border-r border-border/50 backdrop-blur-xl bg-background/60">
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/learning-zone-transparent.dim_64x64.png"
              alt="Learning"
              className="w-8 h-8"
            />
            <h3 className="font-semibold">Learning Modules</h3>
          </div>
        </div>
        <ScrollArea className="h-[calc(100%-5rem)]">
          <div className="p-4 space-y-2">
            {learningModules.map((module) => (
              <Card
                key={module.id}
                className={`p-4 cursor-pointer transition-all hover:bg-accent/10 hover:border-primary/30 ${
                  selectedModule.id === module.id ? 'bg-primary/10 border-primary/50' : ''
                }`}
                onClick={() => setSelectedModule(module)}
              >
                <div className="flex items-start gap-3">
                  {isModuleCompleted(module.id) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{module.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        <Tabs defaultValue="content" className="flex-1 flex flex-col">
          <div className="border-b border-border/50 backdrop-blur-xl bg-background/60">
            <div className="container mx-auto px-4">
              <TabsList className="bg-transparent border-0">
                <TabsTrigger value="content" className="gap-2">
                  <BookOpen className="h-4 w-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="summaries" className="gap-2">
                  <Lightbulb className="h-4 w-4" />
                  My Summaries
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="content" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="container mx-auto max-w-4xl p-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{selectedModule.title}</h2>
                    <p className="text-muted-foreground">{selectedModule.description}</p>
                  </div>
                  {isModuleCompleted(selectedModule.id) && (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  )}
                </div>

                <Card className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                      {selectedModule.content}
                    </pre>
                  </div>
                </Card>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleCompleteModule(selectedModule.id)}
                    disabled={isModuleCompleted(selectedModule.id)}
                    className="gap-2 bg-gradient-to-r from-primary to-accent"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    {isModuleCompleted(selectedModule.id) ? 'Completed' : 'Mark as Complete'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSaveSummary}
                    className="gap-2"
                  >
                    <Code className="h-4 w-4" />
                    Save Summary
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="summaries" className="flex-1 m-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="container mx-auto max-w-4xl p-6 space-y-4">
                <h2 className="text-2xl font-bold mb-4">Your Saved Summaries</h2>

                {knowledgeSummaries.length === 0 ? (
                  <Card className="p-8 text-center">
                    <Lightbulb className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">
                      No summaries saved yet. Save learning modules to review them later!
                    </p>
                  </Card>
                ) : (
                  knowledgeSummaries.map((summary, index) => (
                    <Card 
                      key={index} 
                      className="p-6 bg-gradient-to-br from-card to-card/50 border-primary/20"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold">{summary.topic}</h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date(Number(summary.createdAt) / 1000000).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed">
                          {summary.content}
                        </pre>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
