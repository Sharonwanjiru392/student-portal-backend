const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access Denied: Unauthorized Role' });
    }
    next();
  };
};

module.exports = allowRoles;
