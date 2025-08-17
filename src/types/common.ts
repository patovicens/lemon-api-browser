export interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export interface RateLimitAlertProps {
  onRetry: () => void;
}
