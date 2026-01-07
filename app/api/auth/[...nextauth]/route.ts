import NextAuth, { NextAuthOptions } from "next-auth";
import { get } from "@vercel/edge-config";
import { TodoistClient } from "@/lib/todoist";

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: "todoist",
      name: "Todoist",
      type: "oauth",
      authorization: {
        url: "https://todoist.com/oauth/authorize",
        params: {
          scope: "data:read_write",
        },
      },
      token: "https://todoist.com/oauth/access_token",
      userinfo: {
        url: "https://api.todoist.com/rest/v2/projects",
        async request({ tokens }) {
          try {
            // Get projects first
            const projectsRes = await fetch(
              "https://api.todoist.com/rest/v2/projects",
              {
                headers: {
                  Authorization: `Bearer ${tokens.access_token}`,
                },
              }
            );

            if (!projectsRes.ok) {
              throw new Error(
                `Failed to fetch projects: ${projectsRes.status}`
              );
            }

            const projects = await projectsRes.json();
            if (!projects || projects.length === 0) {
              throw new Error("No projects found");
            }

            // Get collaborators from first project
            const collabRes = await fetch(
              `https://api.todoist.com/rest/v2/projects/${projects[0].id}/collaborators`,
              {
                headers: {
                  Authorization: `Bearer ${tokens.access_token}`,
                },
              }
            );

            if (!collabRes.ok) {
              throw new Error(
                `Failed to fetch collaborators: ${collabRes.status}`
              );
            }

            const collaborators = await collabRes.json();
            const currentUser = collaborators[0];

            return {
              id:
                currentUser.id ||
                tokens.access_token?.substring(0, 16) ||
                "user",
              email: currentUser.email || "user@todoist.com",
              full_name:
                currentUser.name || currentUser.full_name || "Todoist User",
            };
          } catch (error) {
            console.error("Error fetching user info:", error);
            // Fallback to basic profile
            return {
              id: tokens.access_token?.substring(0, 16) || "user",
              email: "user@todoist.com",
              full_name: "Todoist User",
            };
          }
        },
      },
      clientId: process.env.TODOIST_CLIENT_ID,
      clientSecret: process.env.TODOIST_CLIENT_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          image:
            profile.avatar_big || profile.avatar_medium || profile.avatar_small,
        };
      },
    },
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
    async signIn({ account, user }) {
      if (account?.access_token) {
        try {
          // Get user info from Todoist collaborators
          const client = new TodoistClient(account.access_token);
          const { email, name } = await client.getUserInfo();

          // Store email and name in user object for use in profile
          user.email = email;
          user.name = name;

          // Check whitelist from Edge Config
          const whitelist = await get<string[]>("emailWhitelist");

          if (!whitelist || !whitelist.includes(email)) {
            console.log(`Access denied for email: ${email}`);
            return false;
          }

          console.log(`Access granted for ${name} (${email})`);
          return true;
        } catch (error) {
          console.error("Error checking whitelist:", error);
          return false;
        }
      }
      return false;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
