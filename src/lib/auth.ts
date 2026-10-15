import { betterAuth, APIError } from "better-auth";
import { createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { eq } from "drizzle-orm";

const ALLOWED_DOMAIN = "revou.co";

function isAllowedEmail(email?: string | null): boolean {
    if (!email) return false;
    const domain = email.trim().toLowerCase().split("@")[1];
    return domain === ALLOWED_DOMAIN;
}

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        }
    }),
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false,
    },
    hooks: {
        before: createAuthMiddleware(async (ctx) => {
            if (ctx.path.startsWith("/sign-in") || ctx.path.startsWith("/sign-up")) {
                const body = ctx.body as Record<string, any> | undefined;
                const email = body?.email ? String(body.email) : undefined;
                if (email && !isAllowedEmail(email)) {
                    throw new APIError("FORBIDDEN", {
                        message: `Akses ditolak: Hanya akun dengan email @${ALLOWED_DOMAIN} yang diperbolehkan login atau mendaftar.`,
                    });
                }
            }
        }),
    },
    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    if (!isAllowedEmail(user.email)) {
                        throw new APIError("FORBIDDEN", {
                            message: `Akses ditolak: Hanya email dengan domain @${ALLOWED_DOMAIN} yang diperbolehkan mendaftar.`,
                        });
                    }
                },
            },
        },
        session: {
            create: {
                before: async (session) => {
                    if (session.userId) {
                        const existingUser = await db.query.user.findFirst({
                            where: eq(schema.user.id, session.userId),
                        });
                        if (existingUser && !isAllowedEmail(existingUser.email)) {
                            throw new APIError("FORBIDDEN", {
                                message: `Akses ditolak: Hanya akun dengan email @${ALLOWED_DOMAIN} yang dapat masuk.`,
                            });
                        }
                    }
                },
            },
        },
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            scope: [
                "openid",
                "profile",
                "email",
                "https://www.googleapis.com/auth/calendar.events",
                "https://www.googleapis.com/auth/calendar.readonly",
            ],
            accessType: "offline",
            prompt: "consent",
        },
    },
    secret: process.env.BETTER_AUTH_SECRET || "launcher-os-better-auth-secret-key-2026-production-random-secure",
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
});

