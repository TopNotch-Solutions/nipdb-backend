const jwt = require("jsonwebtoken");
require("dotenv").config();
const {createWebRefreshToken} = require("../../utils/web/generateRefreshToken");
const {createWebToken} = require("../../utils/web/generateToken");

module.exports.tokenAuthMiddleware = (req, res, next) => {
  const token = req.cookies.jwt;
  const refreshToken = req.cookies.refreshToken;

  if (!token && !refreshToken) {
    return res.status(401).json({
      status: "FAILURE",
      message: "Access denied. No tokens provided.",
    });
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.WEB_TOKEN);
      req.user = decoded;

      const newToken = createWebToken(decoded.id, decoded.role);
      const newRefreshToken = createWebRefreshToken(decoded.id, decoded.role);

      res.cookie("jwt", newToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        maxAge: 30 * 60 * 1000,
      });

      next();
    } catch (err) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Invalid token.",
      });
    }
  } else if (refreshToken) {
    try {
      const refreshDecoded = jwt.verify(refreshToken, process.env.WEB_REFRESH_TOKEN);

      const newToken = createWebToken(refreshDecoded.id, refreshDecoded.role);
      const newRefreshToken = createWebRefreshToken(refreshDecoded.id, refreshDecoded.role);
      console.log(newToken, newRefreshToken)
      res.cookie("jwt", newToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        maxAge: 30 * 60 * 1000,
      });

      req.user = refreshDecoded;
      next();
    } catch (refreshErr) {
      return res.status(400).json({
        status: "FAILURE",
        message: "Invalid refresh token.",
      });
    }
  } else {
    return res.status(401).json({
      status: "FAILURE",
      message: "Access denied. No valid tokens provided.",
    });
  }
};

module.exports.checkAdmin = (req, res, next) => {

  if (!req.user) {
    return res.status(401).json({
      status: "FAILURE",
      message: "Access denied. No token provided.",
    });
  }

  try {
    if (req.user.role !== "Super admin" && req.user.role !== "Admin") {
      return res.status(403).json({
        status: "FAILURE",
        message: "Access denied. User does not have access to the route.",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      status: "FAILURE",
      message: "Invalid token.",
    });
  }
};