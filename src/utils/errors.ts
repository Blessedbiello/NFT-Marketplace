import { ERROR_MESSAGES } from './constants';

// Custom error types for better error handling
export class MarketplaceError extends Error {
  constructor(
    message: string,
    public code: string,
    public field?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'MarketplaceError';
  }
}

export class WalletConnectionError extends MarketplaceError {
  constructor(message: string = ERROR_MESSAGES.WALLET_NOT_CONNECTED, details?: any) {
    super(message, 'WALLET_CONNECTION_ERROR', undefined, details);
    this.name = 'WalletConnectionError';
  }
}

export class TransactionError extends MarketplaceError {
  constructor(
    message: string = ERROR_MESSAGES.TRANSACTION_FAILED,
    public transactionId?: string,
    details?: any
  ) {
    super(message, 'TRANSACTION_ERROR', undefined, details);
    this.name = 'TransactionError';
  }
}

export class ValidationError extends MarketplaceError {
  constructor(message: string, field: string, details?: any) {
    super(message, 'VALIDATION_ERROR', field, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends MarketplaceError {
  constructor(message: string = ERROR_MESSAGES.NETWORK_ERROR, details?: any) {
    super(message, 'NETWORK_ERROR', undefined, details);
    this.name = 'NetworkError';
  }
}

export class RateLimitError extends MarketplaceError {
  constructor(message: string = ERROR_MESSAGES.RATE_LIMIT_EXCEEDED, details?: any) {
    super(message, 'RATE_LIMIT_ERROR', undefined, details);
    this.name = 'RateLimitError';
  }
}

export class InsufficientBalanceError extends MarketplaceError {
  constructor(
    message: string = ERROR_MESSAGES.INSUFFICIENT_BALANCE,
    public required?: number,
    public available?: number
  ) {
    super(message, 'INSUFFICIENT_BALANCE_ERROR', undefined, { required, available });
    this.name = 'InsufficientBalanceError';
  }
}

// Error classification utility
export const classifyError = (error: any): MarketplaceError => {
  // Handle known error types
  if (error instanceof MarketplaceError) {
    return error;
  }

  // Handle Solana/Anchor errors
  if (error?.code) {
    switch (error.code) {
      case 'WalletNotConnectedError':
        return new WalletConnectionError();
      case 'WalletConnectionError':
        return new WalletConnectionError(error.message);
      case 'SendTransactionError':
        return new TransactionError(error.message);
      case 'InsufficientFundsError':
        return new InsufficientBalanceError();
      default:
        break;
    }
  }

  // Handle network errors
  if (error?.name === 'NetworkError' || error?.message?.includes('network')) {
    return new NetworkError(error.message);
  }

  // Handle timeout errors
  if (error?.message?.includes('timeout')) {
    return new NetworkError('Request timed out. Please try again.');
  }

  // Handle validation errors
  if (error?.name === 'ValidationError') {
    return new ValidationError(error.message, error.field);
  }

  // Default to generic marketplace error
  return new MarketplaceError(
    error?.message || ERROR_MESSAGES.UNKNOWN_ERROR,
    'UNKNOWN_ERROR',
    undefined,
    error
  );
};

// Error logging utility
export const logError = (error: MarketplaceError, context?: string) => {
  const errorLog = {
    name: error.name,
    code: error.code,
    message: error.message,
    field: error.field,
    details: error.details,
    context,
    timestamp: new Date().toISOString(),
    stack: error.stack,
  };

  // Only log in development
  if (import.meta.env.DEV) {
    console.error('Marketplace Error:', errorLog);
  }

  // In production, you would send this to your error tracking service
  // Example: Sentry, LogRocket, etc.
  if (import.meta.env.PROD && import.meta.env.VITE_ENABLE_ERROR_TRACKING) {
    // sendToErrorTrackingService(errorLog);
  }
};

// User-friendly error message formatter
export const formatErrorForUser = (error: MarketplaceError): string => {
  switch (error.code) {
    case 'WALLET_CONNECTION_ERROR':
      return 'Please connect your wallet and try again.';
    case 'TRANSACTION_ERROR':
      return 'Transaction failed. Please check your balance and try again.';
    case 'VALIDATION_ERROR':
      return error.message; // Validation errors are already user-friendly
    case 'NETWORK_ERROR':
      return 'Network connection issue. Please check your internet and try again.';
    case 'RATE_LIMIT_ERROR':
      return 'You\'re making requests too quickly. Please wait a moment and try again.';
    case 'INSUFFICIENT_BALANCE_ERROR':
      return 'Insufficient balance to complete this transaction.';
    default:
      return 'Something went wrong. Please try again or contact support if the problem persists.';
  }
};

// Error recovery suggestions
export const getErrorRecoveryActions = (error: MarketplaceError): string[] => {
  switch (error.code) {
    case 'WALLET_CONNECTION_ERROR':
      return [
        'Connect your wallet',
        'Refresh the page',
        'Try a different wallet',
      ];
    case 'TRANSACTION_ERROR':
      return [
        'Check your SOL balance',
        'Wait a moment and try again',
        'Reduce transaction amount',
        'Check network connection',
      ];
    case 'NETWORK_ERROR':
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Switch to a different network',
      ];
    case 'RATE_LIMIT_ERROR':
      return [
        'Wait 1-2 minutes',
        'Reduce request frequency',
      ];
    case 'INSUFFICIENT_BALANCE_ERROR':
      return [
        'Add more SOL to your wallet',
        'Choose a lower-priced NFT',
        'Check for network fees',
      ];
    default:
      return [
        'Try refreshing the page',
        'Check your wallet connection',
        'Contact support if issue persists',
      ];
  }
};