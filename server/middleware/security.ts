import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import { Express } from 'express';

export const configureSecurityMiddleware = (app: Express) => {
  // Basic security headers
  app.use(helmet());

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
  });

  // Apply rate limiting to all routes
  app.use(limiter);

  // Stricter rate limit for auth routes
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
    message: 'Too many login attempts, please try again later.',
  });

  app.use('/api/auth/login', authLimiter);
};