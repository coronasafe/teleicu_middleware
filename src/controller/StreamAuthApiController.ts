import { Request, Response } from "express";

import { generateJWT, verifyJWT } from "@/lib/jose";

export class StreamAuthApiController {
  static getVideoFeedStreamToken = async (req: Request, res: Response) => {
    const { stream, ip, _duration } = req.body;
    if (!stream || !ip) {
      return res.status(400).json({ message: "stream and ip are required" });
    }

    try {
      const duration = parseInt(_duration ?? "5");
      if (duration < 0 || duration > 60) {
        return res
          .status(400)
          .json({ message: "duration must be between 0 and 60" });
      }

      const token = await generateJWT({ stream, ip }, `${duration}m`);

      return res.status(200).json({ token });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };

  static getVitalStreamToken = async (req: Request, res: Response) => {
    const { asset_id, ip, _duration } = req.body;
    if (!asset_id || !ip) {
      return res.status(400).json({ message: "asset_id and ip are required" });
    }

    try {
      const duration = parseInt(_duration ?? "5");
      if (duration < 0 || duration > 60) {
        return res
          .status(400)
          .json({ message: "duration must be between 0 and 60" });
      }

      const token = await generateJWT({ asset_id, ip }, `${duration}m`);

      return res.status(200).json({ token });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };

  static validateStreamToken = async (req: Request, res: Response) => {
    const { token, ip, stream } = req.body;
    if (!token || !ip || !stream) {
      return res
        .status(400)
        .json({ message: "token, stream, and ip are required" });
    }

    try {
      const decoded = await verifyJWT(token);
      if (decoded.ip === ip || decoded.stream === stream) {
        return res.status(200).json({ status: 1 });
      }

      return res.status(401).json({ status: 0 });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  };
}
