import { Request } from "express";

export const parseRequestToken = (req: Request): string => req.headers['X-Auth-Token'] as any as string;