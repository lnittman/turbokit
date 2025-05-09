import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

import { ApiError, handleZodError } from './error';
import { ResourceType, ErrorType } from '../constants';

export class ApiResponse {
  static success<T>(data: T, status = 200) {
    return NextResponse.json(
      { success: true, data },
      { status }
    );
  }

  static error(message: string, status = 500, details?: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message,
          ...(details ? { details } : {})
        } 
      },
      { status }
    );
  }

  static fromApiError(error: ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {})
        }
      },
      { status: error.status }
    );
  }
}

/**
 * Wrapper for route handlers to simplify error handling
 * @param handler The route handler function
 * @returns A wrapped handler function with error handling
 */
export function withErrorHandling(handler: Function) {
  return async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle ApiError instances directly
      if (error instanceof ApiError) {
        return ApiResponse.fromApiError(error);
      }
      
      // Handle ZodError instances
      if (error instanceof ZodError) {
        return ApiResponse.fromApiError(handleZodError(error));
      }
      
      // Convert standard errors to ApiError based on message patterns
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        if (message.includes('not found')) {
          return ApiResponse.fromApiError(ApiError.notFound(ResourceType.RESOURCE));
        }
        
        if (message.includes('unauthorized') || message.includes('not authorized')) {
          return ApiResponse.fromApiError(ApiError.unauthorized());
        }
        
        if (message.includes('authentication') || message.includes('not authenticated')) {
          return ApiResponse.fromApiError(ApiError.unauthenticated());
        }
        
        if (message.includes('validation')) {
          return ApiResponse.fromApiError(ApiError.validation({ message: error.message }));
        }
      }
      
      // Default to generic server error
      return ApiResponse.fromApiError(new ApiError(ErrorType.SERVER_ERROR));
    }
  };
}
