import { handlers } from "../../../../auth"

/**
 * NextAuth.js API Route Handlers
 * 
 * This file exports the GET and POST handlers from the Auth.js configuration
 * to handle all authentication requests via the /api/auth/* routes.
 * 
 * Routes handled:
 * - /api/auth/signin
 * - /api/auth/signout  
 * - /api/auth/callback/*
 * - /api/auth/session
 * - /api/auth/providers
 * - /api/auth/csrf
 */
export const { GET, POST } = handlers 