# TechFx Backend  
  
Backend para sistema de gestión de tickets de reparación de computadoras.  
  
## Tecnologías utilizadas  
  
- Node.js  
- Express  
- MongoDB  
- JWT para autenticación  
- Docker para desarrollo local  
  
## Configuración del proyecto  
  
### Pre requisitos  
  
- Node.js  
- Docker y Docker Compose  
- MongoDB  
  


### Crear archivo .env en la raíz del proyecto

.env
PORT= <usualmente se usa el 3000>  
MONGODB_URI=<similar al empleado en el docker-compose>
JWT_SECRET= <cualquier clave que quiera>

### Iniciar servicios con Docker

npm run docker:up  

### Crear usuario administrador (solo para pruebas y test)

npm run init-admin  

### Iniciar el servidor en modo desarrollo
npm run dev  

Estructura del proyecto

src/  
├── config/         # Configuraciones  
├── controllers/    # Controladores  
├── middleware/     # Middleware  
├── models/         # Modelos de MongoDB  
├── routes/         # Rutas de la API  
└── scripts/        # Scripts de utilidad  

Scripts disponibles

* npm run dev: Inicia el servidor en modo desarrollo
*npm start: Inicia el servidor en modo producción
* npm run docker:up: Inicia los servicios de Docker
*npm run docker:down: Detiene los servicios de Docker
* npm run init-admin: Crea el usuario administrador inicial
