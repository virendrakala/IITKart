import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protect = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const token = authHeader.split(" ")[1] as string;

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as unknown as { id: number; role: string };

    req.user = {
      id: decoded.id,
      role: decoded.role as any
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid" });
  }
};