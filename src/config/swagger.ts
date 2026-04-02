import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  logoutSchema,
} from '../modules/auth/auth.schemas';
import { updateUserSchema, changePasswordSchema } from '../modules/users/user.schemas';

extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

// --- Schemas reutilizáveis ---

const UserSchema = registry.register(
  'User',
  z.object({
    id: z.string().uuid(),
    email: z.email(),
    username: z.string(),
    is_active: z.boolean(),
    is_verified: z.boolean(),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime(),
  }),
);

const TokensSchema = registry.register(
  'Tokens',
  z.object({
    user: z.object({
      id: z.uuid(),
      email: z.email(),
      username: z.string(),
    }),
    accessToken: z.string(),
    refreshToken: z.string(),
  }),
);

const ErrorSchema = registry.register(
  'Error',
  z.object({
    error: z.string(),
  }),
);

// --- Auth endpoints ---

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/register',
  tags: ['Auth'],
  summary: 'Register a new user',
  request: { body: { content: { 'application/json': { schema: registerSchema } } } },
  responses: {
    201: {
      description: 'User registered',
      content: { 'application/json': { schema: TokensSchema } },
    },
    400: {
      description: 'Validation error',
      content: { 'application/json': { schema: ErrorSchema } },
    },
    409: {
      description: 'Email or username already in use',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  tags: ['Auth'],
  summary: 'Login with email and password',
  request: { body: { content: { 'application/json': { schema: loginSchema } } } },
  responses: {
    200: {
      description: 'Login successful',
      content: { 'application/json': { schema: TokensSchema } },
    },
    401: {
      description: 'Invalid credentials',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/refresh',
  tags: ['Auth'],
  summary: 'Refresh access token',
  request: { body: { content: { 'application/json': { schema: refreshTokenSchema } } } },
  responses: {
    200: {
      description: 'New tokens',
      content: {
        'application/json': {
          schema: z.object({ accessToken: z.string(), refreshToken: z.string() }),
        },
      },
    },
    401: {
      description: 'Invalid or expired refresh token',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/logout',
  tags: ['Auth'],
  summary: 'Logout and revoke refresh token',
  request: { body: { content: { 'application/json': { schema: logoutSchema } } } },
  responses: {
    204: { description: 'Logged out successfully' },
    401: {
      description: 'Invalid or expired refresh token',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

// --- Users endpoints ---

const bearerAuth = registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/users/me',
  tags: ['Users'],
  summary: 'Get current user',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    200: {
      description: 'Current user data',
      content: { 'application/json': { schema: UserSchema } },
    },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/v1/users/me',
  tags: ['Users'],
  summary: 'Update current user',
  security: [{ [bearerAuth.name]: [] }],
  request: { body: { content: { 'application/json': { schema: updateUserSchema } } } },
  responses: {
    200: { description: 'Updated user', content: { 'application/json': { schema: UserSchema } } },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/v1/users/me',
  tags: ['Users'],
  summary: 'Delete current user account',
  security: [{ [bearerAuth.name]: [] }],
  responses: {
    204: { description: 'Account deleted' },
    401: { description: 'Unauthorized', content: { 'application/json': { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/users/me/password',
  tags: ['Users'],
  summary: 'Change password',
  security: [{ [bearerAuth.name]: [] }],
  request: { body: { content: { 'application/json': { schema: changePasswordSchema } } } },
  responses: {
    204: { description: 'Password changed' },
    401: {
      description: 'Unauthorized or wrong current password',
      content: { 'application/json': { schema: ErrorSchema } },
    },
  },
});

// --- Health check ---

registry.registerPath({
  method: 'get',
  path: '/api/v1/health',
  tags: ['Health'],
  summary: 'API health check',
  responses: {
    200: {
      description: 'API is healthy',
      content: {
        'application/json': {
          schema: z.object({
            status: z.string(),
            database: z.string(),
            timestamp: z.string(),
          }),
        },
      },
    },
  },
});

// --- Gerador ---

export const generateOpenApiDocument = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      title: 'Auth API',
      version: '1.0.0',
      description: 'RESTful Authentication Service com Node.js, TypeScript e PostgreSQL',
    },
    servers: [{ url: 'http://localhost:3000' }],
  });
};
