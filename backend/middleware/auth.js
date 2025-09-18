import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token =
      authHeader && authHeader.startsWith("Bearer") && authHeader.split("")[1];

    if (!token) {
      res.status(401).json({ message: "Access Denied" });
      throw new Error("Access Denied");
    }

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SCERET);

    // get user from token
    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Invalid token or user not found",
      });
    }
    //update last login
    user.lastLoginAt = new Date();
    await user.save();

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(405).json({
        mesaage: "Invalid Token",
      });
    }

    if (error.name === "TokenExpirationError") {
      return res.status(403).json({
        mesaage: "Token Expired",
      });
    }

    console.error(error);
    return res.status(401).json({
      mesaage: "Authentication error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export default authenticateToken;
