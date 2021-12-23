import express, { request } from "express";
import { ObjectId } from "mongodb";
import RequestService, { ICreateRequest, IUpdateRequest, RequestStatusEnum } from "../models/request";
import { UserService } from "../models/user";
import { parseRequestToken } from "../utils/http";
import Telegram from "../utils/telegram";

const requestRouter = express.Router();

requestRouter.get('/request/:id', async (req, res) => {
  const id = req.params.id;
  
  const request = await RequestService.getById(id)
  if (request) res.status(200).send(request.getData())
  else res.status(404).send('Request not found')
});

requestRouter.get('/request', async (req, res) => {
  const token = parseRequestToken(req)
  const user = await UserService.getByToken(token)

  const requestList = await RequestService.get({
    userId: user?.data._id
  })

  if (requestList) res.status(200).send(requestList.map(request => request.getView()))
  else res.status(404).send('Requests not found')
});

requestRouter.post<any, any, any, ICreateRequest>('/request', async (req, res) => {
  const token = parseRequestToken(req);
  const user = await UserService.getByToken(token)

  const requestData: ICreateRequest = {
    coinFrom: req.body.coinFrom,
    coinTo: req.body.coinTo,
    countFrom: req.body.countFrom,
    countTo: req.body.countTo,
  }

  if (user?.data._id) {
    requestData.userId = new ObjectId(user?.data._id)
  }

  if (req.body.coinTo.isBtc) requestData.wallet = req.body.wallet
  else requestData.card = req.body.card

  const requestId = await RequestService.create(requestData)
  if (!requestId) return;
  const request = await RequestService.getById(requestId);
  if (!request) return;

  const requestModel = request.getData();

  try {
    await Telegram.sendRequestMessage({
      _id: requestId,
      coinFrom: requestModel.coinFrom,
      coinTo: requestModel.coinTo,
      countTo: requestModel.countTo,
      countFrom: requestModel.countFrom,
      createdAt: requestModel.createdAt,
      email: user?.data.email || req.body.email || '',
      phone: user?.data.phone || req.body.phone || '',
      wallet: requestModel.wallet,
      card: requestModel.card,
    })
    res.status(200).send({
      _id: requestId
    })
    return;
  } catch (e) {
    res.status(200).send(requestId ? {
      _id: requestId
    } : {
      error: e
    })
  }
});

requestRouter.delete('/request/:id', async (req, res) => {
  const token = parseRequestToken(req);
  const user = await UserService.getByToken(token)
  if (!user) res.status(404).send('User not found')

  const id = req.params.id;
  const request = await RequestService.getById(id)
  if (!request) return;
  const requestData = request?.getData()

  if (
    (requestData.status === RequestStatusEnum.CANCELLED)
    ||
    (user?.data._id === requestData.userId)
  ) {
    await RequestService.deleteById(id)
    res.status(200).send('OK')
  }
  else {
    res.status(302).send({ 'error': 'You can not do it' });
  }
});

requestRouter.put<any, any, any, IUpdateRequest>('/request/:id', async (req, res) => {
  const token = parseRequestToken(req);
  try {
    const user = await UserService.getByToken(token)
    if (!user) res.status(404).send('User not found')

    const id = req.params.id;
    const data = req.body;
    const request = await RequestService.getById(id)
    if (!request) {
      res.status(404).send('Request not found')
      return;
    }
    const requestData = request?.getData()

    if (
      (requestData.status !== RequestStatusEnum.CANCELLED) ||
      ((user?.data._id === requestData.userId))
    ) {
      await RequestService.update(id, data)
      res.status(200).send({
        _id: id
      })
    }
    else {
      res.send({ 'error': 'You can not do it' });
    }
  } catch(e) {
    res.status(404).send(e)
  }
});

export default requestRouter;