declare global {
  interface CloudflareEnv {
    DB: D1Database;
    DISCORD_WEBHOOK_URL?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    GOOGLE_REDIRECT_URI?: string;
    SESSION_SECRET?: string;
    ADMIN_EMAIL?: string;
  }
}

export {};
