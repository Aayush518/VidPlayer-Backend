import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import hpp from 'hpp';
import { Express } from 'express';

export const configureSecurityMiddleware = (app: Express) => {
  // Basic security headers with CORS allowance
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:5173"],
        frameSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  }));

  // Prevent HTTP Parameter Pollution
  app.use(hpp());

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 100000, // 15 minutes
    max: 1000, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Apply rate limiting to all routes
  app.use(limiter);

  // Stricter rate limit for auth routes
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 100000, // 1 hour
    max: 500, // 5 attempts per hour
    message: 'Too many login attempts, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/auth/login', authLimiter);
  app.use('/api/auth/signup', authLimiter);
};