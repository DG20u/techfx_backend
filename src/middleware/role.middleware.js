// src/middleware/role.middleware.js
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado: Se requiere rol de administrador' });
    }
    next();
  };
  
  const isTechnician = (req, res, next) => {
    if (!['admin', 'technician'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }
    next();
  };
  
  module.exports = { isAdmin, isTechnician };