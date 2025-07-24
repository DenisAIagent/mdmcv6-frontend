import fetch from 'node-fetch';
import { config } from '../config.js';
import { logger } from './logger.js';

export async function sendDiscordAlert(message, severity = 'info') {
  if (!config.discordWebhookUrl) {
    return;
  }

  const colors = {
    info: 0x3498db,
    warning: 0xf39c12,
    error: 0xe74c3c,
    success: 0x2ecc71
  };

  try {
    await fetch(config.discordWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        embeds: [{
          title: 'FlowForge Alert',
          description: message,
          color: colors[severity] || colors.info,
          timestamp: new Date().toISOString()
        }]
      })
    });
  } catch (error) {
    logger.error({ error }, 'Failed to send Discord alert');
  }
}