import jwt from "jsonwebtoken";

import env from "./env.js";

const signToken = (payload, expiresIn) => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

const verifyToken = async (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

export { signToken, verifyToken };
