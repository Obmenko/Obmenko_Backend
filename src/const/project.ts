type EnvConfig = {
  TELEGRAM_BOT_TOKEN: string;
  PORT: string | number;
  TELEGRAM_CHAT_ID: number | string;
}

const PROJECT_CONFIG: EnvConfig =  {
  PORT: process.env.PORT || 8080,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID || 0
}

export default PROJECT_CONFIG;