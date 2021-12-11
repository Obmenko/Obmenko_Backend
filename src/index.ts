import './utils/dotenv'
import express from 'express';
import requestRouter from './controllers/request';
import PROJECT_CONFIG from './const/project';
import cors from 'cors';
import Telegram from './utils/telegram';

Telegram.init(PROJECT_CONFIG.TELEGRAM_BOT_TOKEN)

const app = express();

app.use(cors())
app.use(express.json())

app.use('/api/tg', requestRouter);

app.listen(PROJECT_CONFIG.PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PROJECT_CONFIG.PORT}`);
});