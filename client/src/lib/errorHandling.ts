import { toast } from '@/hooks/use-toast';

// Debug mode flag
export const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';

// Error severity levels
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

interface ErrorLogEntry {
  timestamp: string;
  message: string;
  severity: ErrorSeverity;
  componentName?: string;
  error?: Error;
  context?: Record<string, any>;
}

class ErrorLogger {
  private static logs: ErrorLogEntry[] = [];
  
  static log(
    message: string,
    severity: ErrorSeverity,
    componentName?: string,
    error?: Error,
    context?: Record<string, any>
  ) {
    const entry: ErrorLogEntry = {
      timestamp: new Date().toISOString(),
      message,
      severity,
      componentName,
      error,
      context
    };

    this.logs.push(entry);

    if (isDebugMode) {
      console.group(`🐛 Debug [${severity}] ${componentName || 'Unknown Component'}`);
      console.log('Message:', message);
      console.log('Context:', context);
      if (error) {
        console.error('Error:', error);
        console.log('Stack:', error.stack);
      }
      console.groupEnd();
    }

    // Show toast for medium and higher severity errors
    if (severity !== 'low') {
      toast({
        title: `Error in ${componentName || 'Application'}`,
        description: message,
        variant: "destructive",
      });
    }
  }

  static getLogs(): ErrorLogEntry[] {
    return this.logs;
  }

  static clearLogs(): void {
    this.logs = [];
  }
}

export default ErrorLogger;
