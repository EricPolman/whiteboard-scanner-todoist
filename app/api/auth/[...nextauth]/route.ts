import NextAuth, { NextAuthOptions } from "next-auth";

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
        url: "https://api.todoist.com/sync/v9/sync",
        async request({ tokens }) {
          const res = await fetch("https://api.todoist.com/sync/v9/sync", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${tokens.access_token}`,
            },
            body: JSON.stringify({
              sync_token: "*",
              resource_types: '["user"]',
            }),
          });
          const data = await res.json();
          return data.user;
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
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
