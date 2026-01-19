import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Play, Copy, Check, Code2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSaveCodeExecutionResult, useSendMessage } from '../hooks/useQueries';

interface CodeEditorProps {
  conversationId: string | null;
}

export default function CodeEditor({ conversationId }: CodeEditorProps) {
  const [code, setCode] = useState('// Write your code here\nfunction hello() {\n  console.log("Hello, Riley!");\n}\n\nhello();');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  const saveCodeResult = useSaveCodeExecutionResult();
  const sendMessage = useSendMessage();

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('');

    try {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (...args) => {
        logs.push(args.map(arg => String(arg)).join(' '));
        originalLog(...args);
      };

      try {
        // eslint-disable-next-line no-eval
        eval(code);
        const result = logs.length > 0 ? logs.join('\n') : 'Code executed successfully (no output)';
        setOutput(result);

        await saveCodeResult.mutateAsync({
          code,
          output: result,
          success: true,
        });

        if (conversationId) {
          await sendMessage.mutateAsync({
            conversationId,
            sender: 'User',
            content: code,
            isCodeSnippet: true,
          });

          setTimeout(async () => {
            await sendMessage.mutateAsync({
              conversationId,
              sender: 'Riley',
              content: `Great! I executed your code. Output:\n${result}`,
              isCodeSnippet: false,
            });
          }, 1000);
        }

        toast.success('Code executed successfully!');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        setOutput(`Error: ${errorMessage}`);

        await saveCodeResult.mutateAsync({
          code,
          output: errorMessage,
          success: false,
        });

        toast.error('Code execution failed');
      } finally {
        console.log = originalLog;
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      <div className="container mx-auto max-w-6xl flex-1 flex flex-col gap-4">
        <Card className="flex-1 flex flex-col overflow-hidden bg-gradient-to-br from-card to-card/50 border-primary/20">
          <div className="flex items-center justify-between p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <img
                src="/assets/generated/code-editor-icon-transparent.dim_64x64.png"
                alt="Code Editor"
                className="w-6 h-6"
              />
              <h3 className="font-semibold">Code Editor</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyCode} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button onClick={handleRunCode} disabled={isRunning} className="gap-2 bg-gradient-to-r from-primary to-accent">
                <Play className="h-4 w-4" />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-full resize-none font-mono text-sm border-0 focus-visible:ring-0 bg-background/50"
              placeholder="Write your JavaScript code here..."
            />
          </div>
        </Card>

        {output && (
          <Card className="p-4 bg-gradient-to-br from-card to-card/50 border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="h-4 w-4 text-primary" />
              <h4 className="font-semibold text-sm">Output</h4>
            </div>
            <pre className="text-sm font-mono whitespace-pre-wrap break-words bg-background/50 p-3 rounded-md">
              {output}
            </pre>
          </Card>
        )}
      </div>
    </div>
  );
}
