import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, X, Trash2 } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
}

export default function DebugConsole() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = (level: LogEntry['level'], message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, level, message }]);
  };

  // Expose global logging function
  useEffect(() => {
    (window as any).debugLog = {
      info: (msg: string) => addLog('info', msg),
      warn: (msg: string) => addLog('warn', msg),
      error: (msg: string) => addLog('error', msg),
      debug: (msg: string) => addLog('debug', msg)
    };

    // Override console methods to capture logs
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    console.log = (...args) => {
      addLog('info', args.join(' '));
      originalConsoleLog(...args);
    };

    console.warn = (...args) => {
      addLog('warn', args.join(' '));
      originalConsoleWarn(...args);
    };

    console.error = (...args) => {
      addLog('error', args.join(' '));
      originalConsoleError(...args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, []);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const clearLogs = () => {
    setLogs([]);
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'text-red-400';
      case 'warn': return 'text-yellow-400';
      case 'debug': return 'text-purple-400';
      default: return 'text-green-400';
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-black border-2 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-black pixel-font"
        size="sm"
      >
        <Terminal className="h-4 w-4 mr-2" />
        DEBUG
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-80 z-50 bg-black border-2 border-orange-500 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-orange-400 pixel-font flex items-center">
            <Terminal className="h-4 w-4 mr-2" />
            DEBUG CONSOLE
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={clearLogs}
              variant="outline"
              size="sm"
              className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-black"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              size="sm"
              className="border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-black"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 h-60 overflow-auto bg-gray-900 text-xs font-mono">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">No logs yet...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="mb-1 flex gap-2">
              <span className="text-gray-400 w-16 flex-shrink-0">{log.timestamp}</span>
              <span className={`w-12 flex-shrink-0 ${getLevelColor(log.level)}`}>
                {log.level.toUpperCase()}
              </span>
              <span className="text-gray-300 break-words">{log.message}</span>
            </div>
          ))
        )}
        <div ref={logsEndRef} />
      </CardContent>
    </Card>
  );
}