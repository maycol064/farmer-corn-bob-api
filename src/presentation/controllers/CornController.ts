import type { Request, Response } from 'express';
import { BuyCornUseCase } from '../../application/use-cases/BuyCornUseCase.js';

export class CornController {
  private uc = new BuyCornUseCase();

  buy = async (_req: Request, res: Response) => {
    const out = await this.uc.execute();
    res.status(200).send(out.emoji);
  };
}
