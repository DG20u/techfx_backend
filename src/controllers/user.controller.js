// src/controllers/user.controller.js
const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    const { username, password, fullName, email, role, position } = req.body;

    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ 
      $or: [{ username }, { email }] 
    });
    
    if (userExists) {
      return res.status(400).json({ 
        message: 'Usuario o email ya existe' 
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const user = await User.create({
      username,
      password: hashedPassword,
      fullName,
      email,
      role,
      position
    });

    // Enviar respuesta sin la contraseña
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json(userResponse);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al crear usuario',
      error: error.message 
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener usuarios',
      error: error.message 
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener usuario',
      error: error.message 
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { password, ...updateData } = req.body;
    
    // Si se incluye una nueva contraseña, hashearla
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar usuario',
      error: error.message 
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al eliminar usuario',
      error: error.message 
    });
  }
};