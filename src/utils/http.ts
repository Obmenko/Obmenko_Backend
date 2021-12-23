import { Request } from "express";

export const parseRequestToken = (req: Request): string => req.headers['x-auth-token'] as any as string;