import sgMail  from '@sendgrid/mail';
import express from 'express';
import { ObjectId } from 'mongodb';
import PROJECT_CONFIG from '../const/project';
import RequestService from '../models/request';
import { ICreateUser, IUserAuth, UserService, UserType } from '../models/user';
import { parseRequestToken } from '../utils/http';
import crypto from 'crypto';

sgMail.setApiKey(PROJECT_CONFIG.SENDGRID_API_KEY);

const userRouter = express.Router();

userRouter.get('/user', async (req, res) => {
  const token = parseRequestToken(req)

  const user = await UserService.getByToken(token)
  if (!user) throw new Error()

  res.status(200).send(user)
});

userRouter.post<any, any, any, ICreateUser>('/user', async (req, res) => {
  const userId = await UserService.create(req.body)

  if (userId) res.status(200).send(userId)
  else res.status(400).send('Error')
});

userRouter.get<any, any, any, IUserAuth>('/user/auth', async (req, res) => {
  const user = await UserService.getByAuth(req.body)

  if (!user) res.status(302).send('Error')
  else res.status(200).send({
    token: user?.data.token
  })
});

userRouter.delete('/user', async (req, res) => {
  const token = parseRequestToken(req)

  try {
    const user = await UserService.getByToken(token)
    if (!user) throw new Error()
    const id = user.data._id?.toHexString()
    if (!id) throw new Error()

    await Promise.all([
      UserService.deleteById(id),
      RequestService.delete({
        userId: new ObjectId(id)
      })
    ])
    res.status(200).send('OK')
  } catch(e) {
    res.status(500).send('Error')
  }
});

userRouter.patch<any, any, any, IUserAuth>('/user', async (req, res) => {
  const id = req.params.id;
  
  const user = await UserService.getById(id)

  if (!user) res.status(400).send('User not found')
  else res.status(200).send('OK')
});

userRouter.post('/user/reset', async (req, res) => {
  const email = req.body.email
  const user = await UserService.getByEmail(email)

  if (!user) {
    res.status(400).send('User not found')
    return;
  }

  const id = user.data._id?.toHexString()
  if (!id) {
    res.status(400).send('Error')
    return;
  }

  const updateData = {
    resetPasswordToken: crypto.randomBytes(20).toString('hex'),
    resetPasswordExpires: Date.now() + 3600000,
  }

  await UserService.update(id, updateData)

  try {
    let link = "http://" + req.headers.host + "/api/auth/reset/" + updateData.resetPasswordToken;
    const mailOptions = {
      to: user.data.email,
      from: PROJECT_CONFIG.FROM_EMAIL,
      subject: "Password change request",
      text: `Hi ${user.data.username} \n 
                  Please click on the following link ${link} to reset your password. \n\n 
                  If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };
  
    const mailRes = await sgMail.send(mailOptions)

    res.status(200).json({ message: 'A reset email has been sent to ' + user.data.email + '.' });
  } catch (err) {
    res.status(500).send({ message: err })
  }  
});

userRouter.patch('/api/auth/reset/:token', async (req, res) => {
  const resetPasswordToken = req.params.token;
  const user = await UserService.getByResetPasswordToken(resetPasswordToken)
  const id = user?.data._id?.toHexString()
  if (!id) {
    res.status(400).send('No user')
    return
  }

  await UserService.updatePassword(id, req.body.password)
});
