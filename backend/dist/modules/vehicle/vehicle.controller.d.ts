import { Request, Response } from 'express';
export declare const getStatus: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getResults: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
