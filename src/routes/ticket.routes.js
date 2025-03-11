// src/routes/ticket.routes.js
const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ticketController = require('../controllers/ticket.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { isTechnician } = require('../middleware/role.middleware');
const validateRequest = require('../middleware/validate.middleware');

// Validaciones
const ticketValidations = [
  body('title').trim().notEmpty().withMessage('El título es requerido'),
  body('description').trim().notEmpty().withMessage('La descripción es requerida'),
  body('customerInfo.name').trim().notEmpty().withMessage('El nombre del cliente es requerido'),
  body('customerInfo.phone').trim().notEmpty().withMessage('El teléfono del cliente es requerido'),
  body('customerInfo.email').isEmail().withMessage('Email inválido'),
  body('deviceDetails.type').isIn(['laptop', 'desktop', 'tablet', 'other']).withMessage('Tipo de dispositivo inválido'),
  body('deviceDetails.brand').trim().notEmpty().withMessage('La marca es requerida'),
  body('deviceDetails.model').trim().notEmpty().withMessage('El modelo es requerido'),
  body('deviceDetails.problem').trim().notEmpty().withMessage('El problema es requerido')
];

// Rutas
router.post('/', 
  [authMiddleware, ...ticketValidations, validateRequest],
  ticketController.createTicket
);

router.get('/', 
  authMiddleware,
  ticketController.getAllTickets
);

router.get('/stats', 
  authMiddleware,
  ticketController.getTicketStats
);

router.get('/:id', 
  authMiddleware,
  ticketController.getTicketById
);

router.put('/:id', 
  [authMiddleware, isTechnician, ...ticketValidations, validateRequest],
  ticketController.updateTicket
);

router.post('/:id/notes',
  [
    authMiddleware,
    body('text').trim().notEmpty().withMessage('El texto de la nota es requerido'),
    validateRequest
  ],
  ticketController.addNote
);

module.exports = router;