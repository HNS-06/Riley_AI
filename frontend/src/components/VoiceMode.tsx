import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Message } from '../backend';

interface VoiceModeProps {
  onTranscript: (text: string) => void;
  isThinking: boolean;
  lastMessage: Message | undefined;
}

export default function VoiceMode({ onTranscript, isThinking, lastMessage }: VoiceModeProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const lastMessageRef = useRef<string>('');

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcriptText = event.results[current][0].transcript;
        setTranscript(transcriptText);

        if (event.results[current].isFinal) {
          onTranscript(transcriptText);
          setTranscript('');
          setIsListening(false);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error !== 'no-speech') {
          toast.error('Voice recognition error. Please try again.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [onTranscript]);

  useEffect(() => {
    if (lastMessage && lastMessage.sender === 'Riley' && lastMessage.content !== lastMessageRef.current) {
      lastMessageRef.current = lastMessage.content;
      speakText(lastMessage.content);
    }
  }, [lastMessage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success('Listening...');
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast.error('Failed to start voice recognition');
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <Card className="mb-4 p-4 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/assets/generated/voice-mic-transparent.dim_64x64.png"
            alt="Voice"
            className="w-8 h-8"
          />
          <div>
            <p className="text-sm font-medium">Voice Mode Active</p>
            {transcript && (
              <p className="text-xs text-muted-foreground">"{transcript}"</p>
            )}
            {isListening && !transcript && (
              <p className="text-xs text-muted-foreground animate-pulse">Listening...</p>
            )}
            {isSpeaking && (
              <p className="text-xs text-muted-foreground animate-pulse">Riley is speaking...</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {isSpeaking && (
            <Button
              variant="outline"
              size="sm"
              onClick={stopSpeaking}
              className="gap-2"
            >
              <Volume2 className="h-4 w-4" />
              Stop
            </Button>
          )}
          <Button
            variant={isListening ? "destructive" : "default"}
            size="sm"
            onClick={toggleListening}
            disabled={isThinking}
            className="gap-2"
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {isListening ? 'Stop' : 'Speak'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
