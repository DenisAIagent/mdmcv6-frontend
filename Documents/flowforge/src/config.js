import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/flowforge',
  encryptionKey: process.env.ENCRYPTION_KEY,
  claudeApiKey: process.env.CLAUDE_API_KEY,
  pipedreamApiKey: process.env.PIPEDREAM_API_KEY,
  discordWebhookUrl: process.env.DISCORD_WEBHOOK_URL,
  nodeEnv: process.env.NODE_ENV || 'development'
};