import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: string;
      companyId?: string;
      emailVerified?: Date | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: string;
    companyId?: string;
    emailVerified?: Date | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    companyId?: string;
    emailVerified?: Date | null;
  }
}

declare module "next-auth/adapters" {
  interface AdapterUser {
    role?: string
    companyId?: string
  }
} 