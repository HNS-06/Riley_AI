import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Send, Code2, MessageSquare, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import ChatMessage from '../components/ChatMessage';
import CodeEditor from '../components/CodeEditor';
import ConversationSidebar from '../components/ConversationSidebar';
import ThinkingIndicator from '../components/ThinkingIndicator';
import {
  useStartConversation,
  useSendMessage,
  useGetConversationMessages,
  useSaveUserPreferences,
  useGetUserPreferences,
} from '../hooks/useQueries';
import { getGeminiResponse } from '../services/gemini';

export default function ChatInterface() {
  const { theme, setTheme } = useTheme();
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isRileyThinking, setIsRileyThinking] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'code'>('chat');
  const scrollRef = useRef<HTMLDivElement>(null);

  const startConversation = useStartConversation();
  const sendMessage = useSendMessage();
  const { data: messages = [] } = useGetConversationMessages(currentConversationId);
  const savePreferences = useSaveUserPreferences();
  const { data: userPreferences } = useGetUserPreferences();

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      } else {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }
    }
  }, [messages, isRileyThinking]);



  useEffect(() => {
    if (theme && userPreferences) {
      if (theme !== userPreferences.theme) {
        savePreferences.mutate({ theme, notificationsEnabled: userPreferences.notificationsEnabled });
      }
    }
  }, [theme]);

  const handleStartNewConversation = async () => {
    try {
      const conversationId = await startConversation.mutateAsync('General');
      setCurrentConversationId(conversationId);
    } catch (error) {
      toast.error('Failed to start conversation');
    }
  };



  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    let conversationId = currentConversationId;
    if (!conversationId) {
      try {
        conversationId = await startConversation.mutateAsync('General');
        setCurrentConversationId(conversationId);
      } catch (error) {
        toast.error('Failed to start conversation');
        return;
      }
    }

    const userMessage = inputMessage.trim();
    setInputMessage('');

    try {
      await sendMessage.mutateAsync({
        conversationId: conversationId,
        sender: 'User',
        content: userMessage,
        isCodeSnippet: false,
      });

      setIsRileyThinking(true);

      try {
        const rileyResponse = await getGeminiResponse(userMessage);

        await sendMessage.mutateAsync({
          conversationId: conversationId,
          sender: 'Riley',
          content: rileyResponse,
          isCodeSnippet: false, // You might want to detect code snippets here later
        });
      } catch (error) {
        console.error("Error getting AI response", error);
        toast.error('Failed to get AI response');
        // Fallback or just stop thinking
      } finally {
        setIsRileyThinking(false);
      }
    } catch (error) {
      toast.error('Failed to send message');
      setIsRileyThinking(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <ConversationSidebar
        currentConversationId={currentConversationId}
        onSelectConversation={setCurrentConversationId}
        onNewConversation={handleStartNewConversation}
      />

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 pointer-events-none" />
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <img
            src="/assets/generated/chat-bg-pattern.dim_800x600.png"
            alt=""
            className="w-full h-full object-cover mix-blend-overlay"
          />
        </div>

        <header className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-background/80">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/assets/generated/riley-avatar-transparent.dim_200x200.png"
                  alt="Riley"
                  className="w-12 h-12 rounded-full ring-2 ring-primary/20 shadow-lg shadow-primary/10"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Riley
                </h1>
                <p className="text-xs text-muted-foreground">AI Coding Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'chat' | 'code')} className="flex-1 flex flex-col relative z-10 min-h-0">
          <div className="border-b border-border/50 backdrop-blur-xl bg-background/60">
            <div className="container mx-auto px-4">
              <TabsList className="bg-transparent border-0">
                <TabsTrigger value="chat" className="gap-2 data-[state=active]:bg-primary/10">
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-2 data-[state=active]:bg-primary/10">
                  <Code2 className="h-4 w-4" />
                  Code Editor
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="chat" className="flex-1 flex flex-col m-0 overflow-hidden min-h-0">
            <ScrollArea className="flex-1 px-4 min-h-0">
              <div ref={scrollRef} className="container mx-auto py-6 space-y-4 max-w-4xl">
                {messages.length === 0 && !isRileyThinking && (
                  <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                      <Sparkles className="h-16 w-16 text-primary relative z-10" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-bold">Welcome to Riley!</h2>
                      <p className="text-muted-foreground max-w-md">
                        Your AI assistant for coding help, homework support, and general knowledge. Ask me anything!
                      </p>
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}

                {isRileyThinking && <ThinkingIndicator />}
              </div>
            </ScrollArea>

            <div className="border-t border-border/50 backdrop-blur-xl bg-background/80 p-4">
              <div className="container mx-auto max-w-4xl">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask Riley anything..."
                      className="pr-12 bg-background/50 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl"
                      disabled={sendMessage.isPending || isRileyThinking}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || sendMessage.isPending || isRileyThinking}
                    className="rounded-xl bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
                    size="icon"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="code" className="flex-1 m-0 overflow-hidden">
            <CodeEditor conversationId={currentConversationId} />
          </TabsContent>
        </Tabs>

        <footer className="relative z-10 border-t border-border/50 backdrop-blur-xl bg-background/80 py-3">
          <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
            © 2025 Riley AI
          </div>
        </footer>
      </div>
    </div>
  );
}
