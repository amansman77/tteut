declare global {
  interface CloudflareEnv {
    DB: D1Database;
    DISCORD_WEBHOOK_URL?: string;
  }
}

export {};
