type EnvConfig = {
  TELEGRAM_BOT_TOKEN: string;
  PORT: string | number;
  TELEGRAM_CHAT_ID: number | string;
  MONGODB_URL: string;
  SENDGRID_API_KEY: string;
  FROM_EMAIL: string;
}

const PROJECT_CONFIG: EnvConfig =  {
  PORT: process.env.PORT || 8080,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || 0,
  MONGODB_URL: process.env.MONGODB_URL || '',
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || '',
  FROM_EMAIL: process.env.FROM_EMAIL || ''
}

export default PROJECT_CONFIG;