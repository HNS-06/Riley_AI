import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import ChatInterface from './pages/ChatInterface';

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-background">
        <ChatInterface />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
