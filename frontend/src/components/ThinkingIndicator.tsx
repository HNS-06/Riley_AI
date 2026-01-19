import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sparkles } from 'lucide-react';

export default function ThinkingIndicator() {
  return (
    <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Avatar className="h-10 w-10 ring-2 ring-primary/30">
        <AvatarImage src="/assets/generated/riley-avatar-transparent.dim_200x200.png" alt="Riley" />
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 max-w-[80%] flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Riley</span>
          <span className="text-xs text-muted-foreground/60">thinking...</span>
        </div>

        <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20">
          <div className="flex items-center gap-2">
            <img
              src="/assets/generated/thinking-animation-transparent.dim_100x100.png"
              alt="Thinking"
              className="w-6 h-6 animate-pulse"
            />
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
