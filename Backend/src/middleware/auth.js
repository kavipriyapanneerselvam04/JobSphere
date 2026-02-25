const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "change_me_in_env";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Access token is missing" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.authUser = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

const allowRoles = (...roles) => (req, res, next) => {
  const userRole = req.authUser?.role;
  if (!userRole || !roles.includes(userRole)) {
    return res.status(403).json({ message: "You are not allowed to perform this action" });
  }
  return next();
};

const matchParamUser = (paramName) => (req, res, next) => {
  const currentId = Number(req.authUser?.id);
  const targetId = Number(req.params[paramName]);
  const userRole = req.authUser?.role;

  if (userRole === "ADMIN" || currentId === targetId) {
    return next();
  }

  return res.status(403).json({ message: "You can only access your own data" });
};

const matchBodyUser = (fieldName) => (req, res, next) => {
  const currentId = Number(req.authUser?.id);
  const targetId = Number(req.body?.[fieldName]);
  const userRole = req.authUser?.role;

  if (userRole === "ADMIN" || currentId === targetId) {
    return next();
  }

  return res.status(403).json({ message: "You can only submit actions for your own account" });
};

module.exports = {
  JWT_SECRET,
  verifyToken,
  allowRoles,
  matchParamUser,
  matchBodyUser,
};
