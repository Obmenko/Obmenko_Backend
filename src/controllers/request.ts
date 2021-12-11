import express from "express";
import { CurrencyDataItemWithWallet } from "../const/currencies";
import { CourseData } from "../types/exchange";
import Telegram from "../utils/telegram";

const requestRouter = express.Router();

export type ICreateRequest = {
  fromSelected: CurrencyDataItemWithWallet,
  toSelected: CurrencyDataItemWithWallet,
  to: string | number,
  from: string | number
  card: number | null;
  wallet: string;
  phone: number | null;
  email: string;
  telegram: string;
  fullname: string;
  course: CourseData,
}

requestRouter.post<any, any, any, ICreateRequest>('/request', (req, res) => {
  const data = req.body;
  try {
    Telegram.sendRequestMessage(data)
  } catch(e) {
    res.send(400).send({
      success: false,
      message: e
    })
  }
  res.status(200).send({
    success: true,
    message: 'OK'
  })
});

export default requestRouter;