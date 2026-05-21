import jwt from "jsonwebtoken";

export const verifyToken = (request, response, next) => {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return response.status(401).send("You Are Not Authorized");
  }
  const token = authHeader.substring(7); // Remove "Bearer " prefix
  jwt.verify(token, process.env.JWT_KEY, async (err, payload) => {
    if (err) return response.status(403).send("Invalid Token");
    request.userId = payload.userId;
    next();
  });
};
