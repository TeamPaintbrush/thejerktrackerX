// Auth types extension for next-auth
import 'next-auth';

declare module 'next-auth' {
  interface User {
    role?: string;
  }
  
  interface Session {
    user: User & {
      role?: string;
    };
  }
}