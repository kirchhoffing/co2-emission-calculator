import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    role?: string
    companyId?: string
  }

  interface Session {
    user: {
      id: string
      email: string
      name: string
      image?: string
      role?: string
      companyId?: string
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string
    companyId?: string
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    role?: string
    companyId?: string
  }
} 