const express = require("express");
const jwt = require("jsonwebtoken");
const users = require("./db/users");
const { authentication } = require("./utils/authentication");
const { refresh } = require("./db/env");

const {
  generateAccessToken,
  generateRefreshToken,
} = require("./utils/generateToken");

const app = express();
const port = 5000;
app.use(express.json());

// DATABASE
let refreshTokens = [];

// REFRESH TOKEN
app.post("/api/refresh", (req, res) => {
  const refreshToken = req.body.token;

  if (!refreshToken) return res.status(401).json("You are not authenticated!");

  if (!refreshTokens.includes(refreshToken)) {
    return res.status(403).json("Refresh token is not valid!");
  }

  jwt.verify(refreshToken, refresh, (err, user) => {
    if (err) return res.status(403).json(err.message);

    refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    refreshTokens.push(newRefreshToken);

    res
      .status(200)
      .json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  });
});

// LOGIN
app.post("/api/login", (req, res) => {
  const { name, password } = req.body;

  const user = users.find((u) => u.name === name && u.password === password);

  if (user) {
    // GENERATE AN ACCESS TOKEN
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    refreshTokens.push(refreshToken);

    res
      .status(200)
      .json({ name, isAdmin: user.isAdmin, accessToken, refreshToken });
  } else {
    res.status(404).json("User not found!");
  }
});

// DELETE
app.delete("/api/users/:id", authentication, (req, res) => {
  if (req.user.id === Number(req.params.id) || req.user.isAdmin) {
    res.status(200).json("User has been deleted.");
  } else {
    res.status(403).json("You are not allowed to delete this user!");
  }
});

// LOGOUT
app.post("/api/logout", authentication, (req, res) => {
  const refreshToken = req.body.token;
  console.log(refreshTokens);
  refreshTokens = refreshTokens.filter((token) => token !== refreshToken);

  res.status(200).json("You logged out successfully");
});

// APP LISTEN
app.listen(port, () => console.log("app running"));
