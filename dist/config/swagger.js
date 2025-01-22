"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.specs = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Video Sharing Platform API',
            version: '1.0.0',
            description: `
## Overview
A powerful video sharing platform API with comprehensive features for content management, user authentication, and analytics.

### Key Features
- User Authentication & Authorization
- Video Management
- Content Moderation
- Analytics & Reporting
- Admin Dashboard

### Quick Start Guide

1. Create an admin account:
   \`\`\`
   POST /api/auth/signup
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   \`\`\`

2. Login to get JWT token:
   \`\`\`
   POST /api/auth/login
   {
     "email": "admin@example.com",
     "password": "admin123"
   }
   \`\`\`

3. Use the JWT token in the Authorize button above:
   \`\`\`
   Bearer <your_token>
   \`\`\`

### Testing Admin Features
1. After logging in, click the "Authorize" button at the top
2. Enter your JWT token in the format: \`Bearer <your_token>\`
3. All admin endpoints will now be accessible

### Authentication
All protected endpoints require a JWT token in the Authorization header:
\`\`\`
Authorization: Bearer <your_token>
\`\`\`

### Rate Limiting
- General endpoints: 100 requests per 15 minutes
- Authentication endpoints: 5 attempts per hour

### Error Responses
All endpoints may return these error responses:
- \`400\` - Bad Request
- \`401\` - Unauthorized
- \`403\` - Forbidden
- \`404\` - Not Found
- \`429\` - Too Many Requests
- \`500\` - Internal Server Error
      `,
        },
        servers: [
            {
                url: 'http://localhost:5001',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token in the format: Bearer <token>',
                },
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'Error message'
                        },
                        code: {
                            type: 'string',
                            description: 'Error code'
                        }
                    }
                }
            }
        },
        security: [
            { bearerAuth: [] }
        ],
    },
    apis: ['./server/routes/*.ts'],
};
exports.specs = (0, swagger_jsdoc_1.default)(options);
