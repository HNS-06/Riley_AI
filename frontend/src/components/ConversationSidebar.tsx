import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Plus, MessageSquare, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { useGetAllConversations, useDeleteConversation } from '../hooks/useQueries';
import { cn } from '@/lib/utils';

interface ConversationSidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
}

export default function ConversationSidebar({
  currentConversationId,
  onSelectConversation,
  onNewConversation,
}: ConversationSidebarProps) {
  const { data: conversations = [] } = useGetAllConversations();
  const deleteConversation = useDeleteConversation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-16 border-r border-border/50 backdrop-blur-xl bg-background/80 flex flex-col items-center py-4 gap-4">
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(false)} className="rounded-full">
          <ChevronRight className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onNewConversation} className="rounded-full">
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-80 border-r border-border/50 backdrop-blur-xl bg-background/80 flex flex-col">
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <h2 className="font-semibold text-lg">Conversations</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(true)} className="rounded-full">
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4">
        <Button onClick={onNewConversation} className="w-full gap-2 bg-gradient-to-r from-primary to-accent">
          <Plus className="h-4 w-4" />
          New Conversation
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className={cn(
                  'p-3 cursor-pointer transition-all hover:bg-accent/10 hover:border-primary/30',
                  currentConversationId === conversation.id && 'bg-primary/10 border-primary/50'
                )}
                onClick={() => onSelectConversation(conversation.id)}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 mt-1 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{conversation.topic}</p>
                    <p className="text-xs text-muted-foreground">
                      {conversation.messages.length} message{conversation.messages.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(Number(conversation.startedAt) / 1000000).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation.mutate(conversation.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
