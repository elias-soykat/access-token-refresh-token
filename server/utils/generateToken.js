const jwt = require("jsonwebtoken");
const { access, refresh } = require("../db/env");

exports.generateAccessToken = ({ id, isAdmin }) => {
  return jwt.sign({ id, isAdmin }, access, { expiresIn: "10s" });
};

exports.generateRefreshToken = ({ id, isAdmin }) => {
  return jwt.sign({ id, isAdmin }, refresh);
};
