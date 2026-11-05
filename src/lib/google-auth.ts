import { db } from "@/db";
import { account } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function getValidGoogleAccessToken(userId: string): Promise<string | null> {
  try {
    const userAccount = await db
      .select()
      .from(account)
      .where(and(eq(account.userId, userId), eq(account.providerId, "google")))
      .limit(1);

    if (!userAccount.length || !userAccount[0].accessToken) {
      return null;
    }

    const acc = userAccount[0];
    const now = new Date();

    // If access token is still valid (with 2 min buffer), return it
    if (acc.accessTokenExpiresAt && acc.accessTokenExpiresAt.getTime() > now.getTime() + 120000) {
      return acc.accessToken;
    }

    // If expired but refresh token exists, refresh from Google OAuth endpoint
    if (acc.refreshToken && process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID,
          client_secret: process.env.GOOGLE_CLIENT_SECRET,
          refresh_token: acc.refreshToken,
          grant_type: "refresh_token",
        }),
      });

      if (refreshRes.ok) {
        const tokenData = await refreshRes.json();
        const newAccessToken = tokenData.access_token;
        const expiresIn = tokenData.expires_in || 3600;
        const newExpiresAt = new Date(Date.now() + expiresIn * 1000);

        await db
          .update(account)
          .set({
            accessToken: newAccessToken,
            accessTokenExpiresAt: newExpiresAt,
            updatedAt: new Date(),
          })
          .where(eq(account.id, acc.id));

        return newAccessToken;
      } else {
        const errText = await refreshRes.text();
        console.warn("[GoogleAuth] Failed to refresh token:", refreshRes.status, errText);
      }
    }

    return acc.accessToken;
  } catch (error) {
    console.error("[GoogleAuth] Error getting valid Google access token:", error);
    return null;
  }
}

