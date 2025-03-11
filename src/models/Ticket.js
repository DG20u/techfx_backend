// src/models/Ticket.js
const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  deviceDetails: {
    type: {
      type: String,
      required: true,
      enum: ['laptop', 'desktop', 'tablet', 'other']
    },
    brand: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    serialNumber: String,
    problem: {
      type: String,
      required: true
    }
  },
  notes: [{
    text: String,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  estimatedCost: {
    type: Number,
    default: 0
  },
  finalCost: {
    type: Number
  },
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware para generar número de ticket
ticketSchema.pre('save', async function(next) {
  try {  
    if (!this.ticketNumber) { // Cambiamos la condición  
      const count = await mongoose.model('Ticket').countDocuments();  
      this.ticketNumber = `TKT${String(count + 1).padStart(4, '0')}`;  
    }  
    this.updatedAt = new Date();  
    next();  
  } catch (error) {  
    next(error);  
  }  
});  
  
module.exports = mongoose.model('Ticket', ticketSchema);