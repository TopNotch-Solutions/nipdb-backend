const jwt = require("jsonwebtoken");
require('dotenv').config();

module.exports.createMobileToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.MOBILE_TOKEN,
    {
      expiresIn: 3155760000,
    }
  );
};
