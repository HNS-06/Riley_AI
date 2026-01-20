import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { Message } from '../backend';
import { User, Sparkles, Pencil, X, Check } from 'lucide-react';
import { useEditMessage } from '../hooks/useQueries';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isRiley = message.sender === 'Riley';
  const isUser = message.sender === 'User';
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const editMessage = useEditMessage();

  const handleSaveEdit = () => {
    editMessage.mutate({
      id: message.id,
      conversationId: message.conversation_id,
      newContent: editContent
    });
    setIsEditing(false);
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in fade-in slide-in-from-bottom-4 duration-500 group`}>
      <Avatar className={`h-10 w-10 ${isRiley ? 'ring-2 ring-primary/30' : 'ring-2 ring-accent/30'}`}>
        {isRiley ? (
          <>
            <AvatarImage src="/assets/generated/riley-avatar-transparent.dim_200x200.png" alt="Riley" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-accent">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-accent to-secondary">
            <User className="h-5 w-5" />
          </AvatarFallback>
        )}
      </Avatar>

      <div className={`flex-1 max-w-[90%] md:max-w-[80%] lg:max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">{message.sender}</span>
          <span className="text-xs text-muted-foreground/60">
            {new Date(Number(message.timestamp) / 1000000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isUser && !isEditing && (
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
        </div>

        <Card
          className={`p-4 ${isRiley
            ? 'bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-md shadow-primary/5'
            : 'bg-gradient-to-br from-muted/50 to-muted/30 border-border/50'
            } ${message.isCodeSnippet ? 'font-mono text-sm' : ''} w-full`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px]"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={handleSaveEdit}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              {message.isCodeSnippet ? (
                <pre className="whitespace-pre-wrap break-words">
                  <code>{message.content}</code>
                </pre>
              ) : (
                <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
