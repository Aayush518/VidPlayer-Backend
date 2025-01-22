"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureSecurityMiddleware = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const helmet_1 = __importDefault(require("helmet"));
const hpp_1 = __importDefault(require("hpp"));
const configureSecurityMiddleware = (app) => {
    // Basic security headers
    app.use((0, helmet_1.default)());
    // Prevent HTTP Parameter Pollution
    app.use((0, hpp_1.default)());
    // Rate limiting
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later.',
    });
    // Apply rate limiting to all routes
    app.use(limiter);
    // Stricter rate limit for auth routes
    const authLimiter = (0, express_rate_limit_1.default)({
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5, // 5 attempts per hour
        message: 'Too many login attempts, please try again later.',
    });
    app.use('/api/auth/login', authLimiter);
};
exports.configureSecurityMiddleware = configureSecurityMiddleware;
