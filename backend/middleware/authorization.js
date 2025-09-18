const authorizeRoles = (...roles) => {
  return (res, req, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied",
      });
    }
    next();
  };
};

export default authorizeRoles;
