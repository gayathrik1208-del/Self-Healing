const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { users, nextUserId } = require("../data/store");

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "2h" }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !name.trim() || !email || !email.trim() || !password || !password.trim()) {
    return res.status(400).json({ error: "Name, email, and password are all required." });
  }

  const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with that email already exists." });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: nextUserId(), name: name.trim(), email: email.trim(), passwordHash };
  users.push(user);

  const token = signToken(user);
  return res.status(201).json({ token, user: publicUser(user) });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "That email or password isn't right." });
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    return res.status(401).json({ error: "That email or password isn't right." });
  }

  const token = signToken(user);
  return res.json({ token, user: publicUser(user) });
}

async function me(req, res) {
  const user = users.find((u) => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: "User not found." });
  return res.json({ user: publicUser(user) });
}

module.exports = { register, login, me };
