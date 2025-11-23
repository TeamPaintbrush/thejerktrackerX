import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import TwitterProvider from "next-auth/providers/twitter"
import FacebookProvider from "next-auth/providers/facebook"
import bcrypt from "bcryptjs"
import { DynamoDBService } from "./lib/dynamodb"

// Platform detection for server-side
function detectPlatformServer(): 'web' | 'mobile' {
  // On server side, we default to 'web' since NextAuth runs on server
  // Mobile apps will use their own auth system (MobileAuth)
  return 'web';
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Social OAuth Providers
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    // Email/Password Credentials
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const platform = detectPlatformServer();
          
          // Get user from DynamoDB
          const user = await DynamoDBService.getUserByEmail(credentials.email as string)

          if (!user) {
            return null
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password
          )

          if (!isValidPassword) {
            return null
          }

          // Update lastLoginPlatform
          await DynamoDBService.updateUser(user.id, {
            lastLoginPlatform: platform,
            updatedAt: new Date()
          });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role || "user",
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      const platform = detectPlatformServer();
      
      // Handle OAuth sign-ins (Google, GitHub, Facebook)
      if (account?.provider !== "credentials" && user.email && account) {
        try {
          // Check if user exists in DynamoDB
          let existingUser = await DynamoDBService.getUserByEmail(user.email)
          
          if (!existingUser) {
            // Create new user for social sign-in
            existingUser = await DynamoDBService.createUser({
              name: user.name || 'Social User',
              email: user.email,
              password: '', // No password for OAuth users
              role: 'user',
              provider: account.provider,
              providerId: user.id,
              image: user.image || undefined,
              platform: platform, // Track creation platform
              lastLoginPlatform: platform,
            })
          } else {
            // Update existing user with OAuth info and last login platform
            if (!existingUser.provider && account) {
              await DynamoDBService.updateUser(existingUser.id, {
                provider: account.provider,
                providerId: user.id,
                image: user.image || undefined,
                lastLoginPlatform: platform,
              })
            } else {
              // Just update last login platform
              await DynamoDBService.updateUser(existingUser.id, {
                lastLoginPlatform: platform,
              })
            }
          }
          
          // Store user role in the user object for JWT
          user.role = existingUser?.role || 'user'
          user.id = existingUser?.id || user.id
          
          return true
        } catch (error) {
          console.error('Error handling social sign-in:', error)
          return false
        }
      }
      
      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role || 'user'
        token.provider = account?.provider
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        ;(session.user as any).role = token.role as string
        ;(session.user as any).provider = token.provider as string
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      // Log successful sign-ins for security monitoring
      console.log(`User signed in: ${user.email} via ${account?.provider || 'credentials'}`);
    }
  }
})