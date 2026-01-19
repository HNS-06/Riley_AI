import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Star } from 'lucide-react';
import { useGetAchievements, useGetLearningProgress } from '../hooks/useQueries';

export default function ProgressPanel() {
  const { data: achievements = [] } = useGetAchievements();
  const { data: learningProgress } = useGetLearningProgress();

  const totalModules = 10;
  const completedCount = learningProgress?.completedModules.length || 0;
  const progressPercentage = (completedCount / totalModules) * 100;

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Your Progress</h3>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-6">
          <Card className="p-4 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/30">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Learning Progress</span>
                <span className="text-xs text-muted-foreground">{completedCount}/{totalModules}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <div className="relative h-5">
                <img
                  src="/assets/generated/progress-fill-transparent.dim_200x20.png"
                  alt="Progress"
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                  style={{ clipPath: `inset(0 ${100 - progressPercentage}% 0 0)` }}
                />
              </div>
            </div>
          </Card>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-semibold">Achievements</h4>
            </div>

            {achievements.length === 0 ? (
              <Card className="p-4 text-center">
                <Star className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                <p className="text-xs text-muted-foreground">
                  Start chatting to unlock achievements!
                </p>
              </Card>
            ) : (
              <div className="space-y-2">
                {achievements.map((achievement, index) => (
                  <Card 
                    key={index} 
                    className="p-3 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/30 animate-in fade-in slide-in-from-right duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src="/assets/generated/achievement-badge-transparent.dim_64x64.png"
                        alt="Badge"
                        className="w-10 h-10 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{achievement.name}</p>
                        <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(Number(achievement.achievedAt) / 1000000).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {learningProgress && learningProgress.badges.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold">Badges</h4>
              <div className="flex flex-wrap gap-2">
                {learningProgress.badges.map((badge, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="animate-in fade-in zoom-in duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {badge}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
