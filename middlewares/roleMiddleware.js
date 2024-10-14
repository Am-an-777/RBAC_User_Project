const roleMiddleware = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'user' && req.params.id && req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'User can only CRUD themselves.' });
    }
    next();
  };
};

module.exports = roleMiddleware;
