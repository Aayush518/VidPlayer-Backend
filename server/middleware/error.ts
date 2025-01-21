import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err.stack);

  // Enhanced error responses with more details
  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: 'Validation error',
      errors: err.errors.map((e: any) => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code
      })),
      timestamp: new Date().toISOString()
    });
  }

  if (err.name === 'PrismaClientKnownRequestError') {
    let message = 'Database error';
    // Provide more specific messages for common Prisma errors
    switch (err.code) {
      case 'P2002':
        message = 'Unique constraint violation';
        break;
      case 'P2025':
        message = 'Record not found';
        break;
      case 'P2003':
        message = 'Foreign key constraint violation';
        break;
    }
    
    return res.status(400).json({
      status: 'error',
      code: err.code,
      message,
      details: err.meta,
      timestamp: new Date().toISOString()
    });
  }

  // Generic error response
  res.status(500).json({
    status: 'error',
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack
    }),
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id'] || 'unknown'
  });
};