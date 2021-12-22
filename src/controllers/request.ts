import express, { request } from "express";
import { ObjectId } from "mongodb";
import { CurrencyDataItemWithWallet } from "../const/currencies";
import RequestService, { ICreateRequest, IUpdateRequest, RequestStatusEnum } from "../models/request";
import Request, { RequestType } from "../models/request";
import { UserService } from "../models/user";
import { CourseData, CurrencyUnitEnum } from "../types/exchange";
import { db } from "../utils/db";
import { parseRequestToken } from "../utils/http";
import Telegram from "../utils/telegram";

const requestRouter = express.Router();

requestRouter.get('/request/:id', async (req, res) => {
  const id = req.params.id;
  
  const request = await Request.getById(id)
  if (request) res.status(200).send(request)
  else res.status(404).send('Request not found')
});

requestRouter.get('/request', async (req, res) => {
  const token = parseRequestToken(req)
  const user = await UserService.getByToken(token)

  const requestList = await Request.get({
    userId: user?.data._id
  })
  if (requestList) res.status(200).send(requestList)
  else res.status(404).send('Requests not found')
});

requestRouter.post<any, any, any, ICreateRequest>('/request', async (req, res) => {
  const token = parseRequestToken(req);
  const user = await UserService.getByToken(token)
  if (!user) res.status(404).send('User not found')

  const requestData: ICreateRequest = {
    userId: new ObjectId(user?.data._id),
    coinFrom: req.body.coinFrom,
    coinTo: req.body.coinTo,
    countFrom: req.body.countFrom,
    countTo: req.body.countTo,
  }

  if (req.body.coinTo.isBtc) requestData.wallet = req.body.wallet
  else requestData.card = req.body.card

  const request = await RequestService.create(requestData)

  const data = req.body;
  try {
    await Telegram.sendRequestMessage(data)
  } catch (e) {
    res.send(400).send({
      success: false,
      message: e
    })
  }
  res.status(200).send({
    success: true,
    message: 'OK'
  })

  res.status(200).send(request)
});

requestRouter.delete('/request/:id', async (req, res) => {
  const token = parseRequestToken(req);
  const user = await UserService.getByToken(token)
  if (!user) res.status(404).send('User not found')

  const id = req.params.id;
  const request = await RequestService.getById(id)

  if (
    (request?.data.status === RequestStatusEnum.CANCELLED)
    ||
    (user?.data._id === request?.data.userId)
  ) {
    await RequestService.deleteById(id)
    res.status(200).send('OK')
  }
  else {
    res.status(302).send({ 'error': 'You can not do it' });
  }
});

requestRouter.patch<any, any, any, IUpdateRequest>('/request/:id', async (req, res) => {
  const token = parseRequestToken(req);
  const user = await UserService.getByToken(token)
  if (!user) res.status(404).send('User not found')

  const id = req.params.id;
  const data = req.body;
  const request = await RequestService.getById(id)

  if (
    (request?.data.status === RequestStatusEnum.CANCELLED)
    ||
    (
      (user?.data._id === request?.data.userId)
    )
  ) {
    await RequestService.update(id, data)
  }
  else {
    res.send({ 'error': 'You can not do it' });
  }
});

export default requestRouter;