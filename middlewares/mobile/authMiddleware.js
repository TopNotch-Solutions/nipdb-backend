const jwt = require('jsonwebtoken');
require('dotenv').config();


module.exports.tokenAuthMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({
      status: "FAILURE",
      message: "Access denied. No Authorization header provided.",
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      status: "FAILURE",
      message: "Access denied. No token provided.",
    });
  }

  try {
    const secretKey = process.env.MOBILE_TOKEN;
    const decoded = jwt.verify(token, secretKey);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({
      status: "FAILURE",
      message: "Invalid token.",
    });
  }
};


module.exports.checkUser = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({
      status: "FAILURE",
      message: "Access denied. No Authorization header provided.",
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      status: "FAILURE",
      message: "Access denied. No token provided.",
    });
  }

  try {
    const secretKey = process.env.MOBILE_TOKEN;
    const decoded = jwt.verify(token, secretKey); 
    if (decoded.role !== 'User') {
      return res.status(403).json({
        status: "FAILURE",
        message: "Access denied. User does not have access to this route.",
      });
    }
    console.log(req.user)

    req.user = decoded; 

    next();
  } catch (err) {
    return res.status(401).json({
      status: "FAILURE",
      message: "Invalid token.",
    });
  }
};