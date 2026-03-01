import jwt from "jsonwebtoken";
import { config } from "./config.js";

export function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    config.jwtSecret,
    { expiresIn: "7d" },
  );
}

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.slice(7);
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}
