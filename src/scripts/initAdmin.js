require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Verificar si ya existe un admin
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      console.log('Ya existe un usuario administrador');
      process.exit(0);
    }

    // Crear el admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      username: 'admin',
      password: hashedPassword,
      fullName: 'Administrador Principal',
      email: 'admin@techfx.com',
      role: 'admin',
      position: 'System Administrator',
      active: true
    });

    console.log('Usuario administrador creado exitosamente:');
    console.log({
      username: admin.username,
      email: admin.email,
      role: admin.role
    });
    console.log('\nPuedes iniciar sesión con:');
    console.log('Username: admin');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createAdmin();