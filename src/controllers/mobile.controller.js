// src/controllers/mobile.controller.js
exports.getDashboard = async (req, res) => {
    try {
      const userId = req.user.userId;
   
      // Obtener datos relevantes en una sola consulta
      const [
        myTickets,
        pendingCount,
        urgentCount,
        recentActivity
      ] = await Promise.all([
        Ticket.find({ assignedTo: userId })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('assignedTo', 'fullName'),
        Ticket.countDocuments({ status: 'pending' }),
        Ticket.countDocuments({ priority: 'high' }),
        Ticket.find()
          .sort({ updatedAt: -1 })
          .limit(10)
          .populate('assignedTo', 'fullName')
      ]);
  
      res.json({
        overview: {
          myTickets: myTickets.length,
          pending: pendingCount,
          urgent: urgentCount
        },
        myRecentTickets: myTickets,
        recentActivity,
        lastSync: new Date()
      });
    } catch (error) {
      res.status(500).json({
        message: 'Error al obtener dashboard',
        error: error.message
      });
    }
  };