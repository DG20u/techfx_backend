// src/controllers/auth.controller.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Buscar usuario
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar si el usuario está activo
    if (!user.active) {
      return res.status(401).json({ message: 'Usuario desactivado' });
    }

    // Generar token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        username: user.username 
      },
      process.env.JWT_SECRET,
      { expiresIn: '15d' }
    );

    // Enviar respuesta
    // Información relevante para la app móvil  
    res.json({  
      token,  
      user: {  
        id: user._id,  
        username: user.username,  
        fullName: user.fullName,  
        role: user.role,  
        email: user.email,  
        position: user.position  
      },  
      preferences: {  
        ticketsPerPage: 10,  
        defaultFilter: 'pending'  
      }  
    });  
  } catch (error) {  
    res.status(500).json({   
      message: 'Error en el servidor',  
      error: error.message   
    });  
  }  
};
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener perfil',
      error: error.message 
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Contraseña actual incorrecta' });
    }

    // Actualizar contraseña
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al cambiar contraseña',
      error: error.message 
    });
  }
};

// Endpoint para refrescar token  
exports.refreshToken = async (req, res) => {  
  try {  
    const user = await User.findById(req.user.userId);  
    const token = jwt.sign(  
      { userId: user._id, role: user.role },  
      process.env.JWT_SECRET,  
      { expiresIn: '30d' }  
    );  
      
    res.json({ token });  
  } catch (error) {  
    res.status(500).json({ message: 'Error al refrescar token' });  
  }  
};