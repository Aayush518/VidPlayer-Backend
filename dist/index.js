"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const user_routes_1 = require("./routes/user.routes");
const video_routes_1 = require("./routes/video.routes");
const auth_routes_1 = require("./routes/auth.routes");
const admin_routes_1 = require("./routes/admin.routes");
const error_1 = require("./middleware/error");
const auth_1 = require("./middleware/auth");
const security_1 = require("./middleware/security");
const swagger_1 = require("./config/swagger");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 5001;
// Security middleware
(0, security_1.configureSecurityMiddleware)(app);
// Basic middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Enhanced Swagger UI options with better styling and features
const swaggerOptions = {
    customCss: `
    /* Modern theme */
    .swagger-ui {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }
    
    /* Header styling */
    .swagger-ui .topbar { 
      display: none;
    }
    .swagger-ui .info {
      margin: 40px 0;
      text-align: center;
    }
    .swagger-ui .info .title {
      font-size: 42px;
      color: #2c3e50;
      font-weight: 700;
    }
    .swagger-ui .info .description {
      font-size: 16px;
      line-height: 1.8;
      max-width: 800px;
      margin: 20px auto;
      color: #34495e;
    }
    
    /* Tag sections */
    .swagger-ui .opblock-tag {
      font-size: 24px;
      border-bottom: 2px solid #eee;
      padding: 20px 0 10px;
      margin: 0 0 15px;
    }
    .swagger-ui .opblock-tag:hover {
      background: none;
      border-bottom-color: #3498db;
    }
    
    /* Endpoint blocks */
    .swagger-ui .opblock {
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      margin-bottom: 15px;
      border: none;
    }
    .swagger-ui .opblock .opblock-summary {
      padding: 15px;
    }
    .swagger-ui .opblock .opblock-summary-method {
      border-radius: 4px;
      min-width: 80px;
    }
    
    /* Request/Response sections */
    .swagger-ui .parameters-container,
    .swagger-ui .responses-wrapper {
      background: #f8f9fa;
      border-radius: 4px;
      margin: 10px 0;
    }
    
    /* Tables */
    .swagger-ui table {
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 4px;
      overflow: hidden;
    }
    .swagger-ui table thead tr th {
      background: #f1f3f5;
      color: #2c3e50;
      padding: 12px;
    }
    
    /* Buttons */
    .swagger-ui .btn {
      border-radius: 4px;
      text-transform: none;
      font-weight: 500;
      padding: 8px 16px;
    }
    
    /* Code samples */
    .swagger-ui .highlight-code {
      background: #2c3e50;
      border-radius: 4px;
      margin: 10px 0;
    }
    
    /* Models */
    .swagger-ui .model-box {
      background: #f8f9fa;
      border-radius: 4px;
      padding: 15px;
    }
    
    /* Authorize button */
    .swagger-ui .auth-wrapper .authorize {
      border-color: #3498db;
      color: #3498db;
    }
    .swagger-ui .auth-wrapper .authorize svg {
      fill: #3498db;
    }
  `,
    customSiteTitle: "Video Platform API Documentation",
    customfavIcon: "https://cdn-icons-png.flaticon.com/512/1179/1179069.png",
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
        syntaxHighlight: {
            theme: 'monokai'
        }
    },
};
// Mount Swagger UI at /api-docs
app.use('/api-docs', swagger_ui_express_1.default.serve);
app.get('/api-docs', swagger_ui_express_1.default.setup(swagger_1.specs, swaggerOptions));
// API routes
app.use('/api/auth', auth_routes_1.authRouter);
app.use('/api/users', auth_1.authenticate, user_routes_1.userRouter);
app.use('/api/videos', auth_1.authenticate, video_routes_1.videoRouter);
app.use('/api/admin', auth_1.authenticate, admin_routes_1.adminRouter);
// Add a redirect from root to api-docs
app.get('/', (req, res) => {
    res.redirect('/api-docs');
});
// Error handling
app.use(error_1.errorHandler);
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`API Documentation available at http://localhost:${port}/api-docs`);
});
exports.default = app;
