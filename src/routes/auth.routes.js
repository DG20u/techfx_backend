// src/routes/auth.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validateRequest = require('../middleware/validate.middleware');

// Validaciones
const loginValidations = [
  body('username').notEmpty().withMessage('Usuario requerido'),
  body('password').notEmpty().withMessage('Contraseña requerida')
];

const passwordChangeValidations = [
  body('currentPassword').notEmpty().withMessage('Contraseña actual requerida'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('La nueva contraseña debe tener al menos 6 caracteres')
];

// Rutas
router.post('/login', 
  [loginValidations, validateRequest],
  authController.login
);

router.get('/profile', 
  authMiddleware,
  authController.getProfile
);

router.post('/change-password',
  [authMiddleware, passwordChangeValidations, validateRequest],
  authController.changePassword
);

module.exports = router;