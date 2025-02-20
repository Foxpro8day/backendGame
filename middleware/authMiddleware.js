const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;

// Middleware kiểm tra token (Bearer Token)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.cookie;
  if (!authHeader) {
    return res.status(403).json({ message: "❌ Bạn chưa đăng nhập!" });
  }

  const token = authHeader?.split("token=")[1]?.split(";")[0]; // Lấy giá trị token
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Lưu thông tin user vào request
    next();
  } catch (error) {
    res.status(401).json({ message: "❌ Token không hợp lệ!" });
  }
};

// Middleware kiểm tra quyền Admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "❌ Bạn không có quyền Admin!" });
  }
  next();
};

// Middleware kiểm tra quyền SubAdmin
const subAdminMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "❌ Bạn không có quyền truy cập API này!" });
    }
    next();
  };
};

module.exports = { authMiddleware, adminMiddleware, subAdminMiddleware };
