// src/controllers/ticket.controller.js
const Ticket = require('../models/Ticket');
const User = require('../models/User');

exports.createTicket = async (req, res) => {
  try {
    const ticket = new Ticket({
      ...req.body,
      createdBy: req.user.userId,
      status: 'pending'
    });

    const savedTicket = await ticket.save();

    await savedTicket.populate('assignedTo', 'username fullName');  
    await savedTicket.populate('createdBy', 'username fullName');  
  
    res.status(201).json(savedTicket);  
  } catch (error) {  
    console.error('Error creating ticket:', error); // Para debugging  
    res.status(500).json({  
      message: 'Error al crear ticket',  
      error: error.message  
    });  
  }  
};

exports.getAllTickets = async (req, res) => {
  try {
    const filters = {};
    const { status, priority, assignedTo, search } = req.query;

    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (assignedTo) filters.assignedTo = assignedTo;
    if (search) {
      filters.$or = [
        { ticketNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } }
      ];
    }

    // Si es técnico, solo ver tickets asignados
    if (req.user.role === 'technician') {
      filters.assignedTo = req.user.userId;
    }

    const tickets = await Ticket.find(filters)
      .populate('assignedTo', 'username fullName')
      .populate('createdBy', 'username fullName')
      .sort({ createdAt: -1 });

    res.json(tickets);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener tickets',
      error: error.message
    });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('assignedTo', 'username fullName')
      .populate('createdBy', 'username fullName')
      .populate('notes.createdBy', 'username fullName');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    // Verificar acceso
    if (req.user.role === 'technician' && 
        ticket.assignedTo?._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    res.json(ticket);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener ticket',
      error: error.message
    });
  }
};

exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    // Verificar permisos
    if (req.user.role === 'technician' && 
        ticket.assignedTo?.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Acceso denegado' });
    }

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    ).populate('assignedTo', 'username fullName');

    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({
      message: 'Error al actualizar ticket',
      error: error.message
    });
  }
};

exports.addNote = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket no encontrado' });
    }

    ticket.notes.push({
      text: req.body.text,
      createdBy: req.user.userId
    });

    await ticket.save();
    await ticket.populate('notes.createdBy', 'username fullName');

    res.json(ticket);
  } catch (error) {
    res.status(500).json({
      message: 'Error al agregar nota',
      error: error.message
    });
  }
};

exports.getTicketStats = async (req, res) => {
  try {
    const stats = await Ticket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Ticket.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      byStatus: stats,
      byPriority: priorityStats
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

 
exports.searchTickets = async (req, res) => {  
    try {  
      const { query, filter } = req.query;  
      const page = parseInt(req.query.page) || 1;  
      const limit = parseInt(req.query.limit) || 10; // Paginación para móvil  
    
      let searchQuery = {};  
    
      // Búsqueda general  
      if (query) {  
        searchQuery.$or = [  
          { ticketNumber: { $regex: query, $options: 'i' } },  
          { 'customerInfo.name': { $regex: query, $options: 'i' } },  
          { 'deviceDetails.brand': { $regex: query, $options: 'i' } },  
          { 'deviceDetails.model': { $regex: query, $options: 'i' } }  
        ];  
      }  
    
      // Filtros rápidos para móvil  
      if (filter) {  
        switch (filter) {  
          case 'pending':  
            searchQuery.status = 'pending';  
            break;  
          case 'myTickets':  
            searchQuery.assignedTo = req.user.userId;  
            break;  
          case 'urgent':  
            searchQuery.priority = 'high';  
            break;  
          case 'today':  
            const today = new Date();  
            today.setHours(0, 0, 0, 0);  
            searchQuery.createdAt = { $gte: today };  
            break;  
        }  
      }  
    
      const tickets = await Ticket.find(searchQuery)  
        .populate('assignedTo', 'username fullName')  
        .sort({ createdAt: -1 })  
        .skip((page - 1) * limit)  
        .limit(limit);  
    
      const total = await Ticket.countDocuments(searchQuery);  
    
      res.json({  
        tickets,  
        pagination: {  
          current: page,  
          total: Math.ceil(total / limit),  
          hasMore: page * limit < total  
        }  
      });  
    } catch (error) {  
      res.status(500).json({  
        message: 'Error en la búsqueda',  
        error: error.message  
      });  
    }  
  };