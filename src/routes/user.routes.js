// src/routes/user.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/role.middleware');
const validateRequest = require('../middleware/validate.middleware');

// Validaciones para crear/actualizar usuario
const userValidations = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('El usuario debe tener al menos 3 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Email inválido'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('El nombre completo es requerido'),
  body('role')
    .isIn(['admin', 'technician'])
    .withMessage('Rol inválido')
];

// Rutas
router.post('/', 
  [authMiddleware, isAdmin, ...userValidations, validateRequest],
  userController.createUser
);

router.get('/', 
  [authMiddleware, isAdmin],
  userController.getAllUsers
);

router.get('/:id', 
  [authMiddleware],
  userController.getUserById
);

router.put('/:id', 
  [authMiddleware, isAdmin, ...userValidations, validateRequest],
  userController.updateUser
);

router.delete('/:id', 
  [authMiddleware, isAdmin],
  userController.deleteUser
);

module.exports = router;