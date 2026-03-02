# 🚗 Autico API

API RESTful profesional para plataforma de publicación y consulta de automóviles en venta.

## 📋 Características

- ✅ Arquitectura orientada a servicios
- ✅ API RESTful
- ✅ Autenticación JWT
- ✅ Validaciones en backend
- ✅ Separación por capas (Routes, Controllers, Services, Models, Middlewares)
- ✅ Manejo global de errores
- ✅ Paginación
- ✅ Filtros mediante query parameters
- ✅ Código limpio y profesional

## 🛠️ Tecnologías

- **Node.js** - Runtime de JavaScript
- **Express** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - Autenticación
- **bcrypt** - Hash de contraseñas
- **dotenv** - Variables de entorno

## 📁 Estructura del Proyecto

```
autico-api/
├── src/
│   ├── config/
│   │   ├── config.js
│   │   └── database.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── vehicle.controller.js
│   │   ├── question.controller.js
│   │   └── answer.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.middleware.js
│   │   └── checkOwnership.middleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Vehicle.js
│   │   ├── Question.js
│   │   └── Answer.js
│   ├── routes/
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   ├── vehicle.routes.js
│   │   ├── question.routes.js
│   │   └── answer.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── vehicle.service.js
│   │   ├── question.service.js
│   │   └── answer.service.js
│   ├── utils/
│   │   ├── AppError.js
│   │   └── asyncHandler.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd autico-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/autico-db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

### 4. Asegúrate de tener MongoDB corriendo

**Opción 1: MongoDB local**
```bash
mongod
```

**Opción 2: MongoDB Atlas**
Usa una URI de conexión de MongoDB Atlas en el archivo `.env`

### 5. Iniciar el servidor

**Modo desarrollo (con nodemon):**
```bash
npm run dev
```

**Modo producción:**
```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📚 API Endpoints

### 🔐 Autenticación

#### Registrar usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "usuario123",
  "password": "password123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente.",
  "data": {
    "id": "65f1234567890",
    "username": "usuario123"
  }
}
```

#### Iniciar sesión
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "usuario123",
  "password": "password123"
}
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "65f1234567890",
      "username": "usuario123"
    }
  }
}
```

### 🚗 Vehículos (Público)

#### Listar vehículos con filtros
```http
GET /api/vehicles?brand=Toyota&minPrice=10000&maxPrice=50000&page=1&limit=10
```

**Query Parameters (todos opcionales):**
- `brand` - Filtrar por marca
- `model` - Filtrar por modelo
- `minYear` - Año mínimo
- `maxYear` - Año máximo
- `minPrice` - Precio mínimo
- `maxPrice` - Precio máximo
- `status` - Estado (`available` o `sold`)
- `page` - Número de página (default: 1)
- `limit` - Resultados por página (default: 10, max: 100)

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f1234567890",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2020,
      "price": 25000,
      "status": "available",
      "description": "Excelente estado",
      "owner": {
        "_id": "65f9876543210",
        "username": "vendedor1"
      },
      "createdAt": "2024-03-15T10:30:00.000Z",
      "updatedAt": "2024-03-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

#### Obtener vehículo por ID
```http
GET /api/vehicles/:id
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": {
    "_id": "65f1234567890",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "price": 25000,
    "status": "available",
    "description": "Excelente estado",
    "owner": {
      "_id": "65f9876543210",
      "username": "vendedor1"
    },
    "createdAt": "2024-03-15T10:30:00.000Z",
    "updatedAt": "2024-03-15T10:30:00.000Z"
  }
}
```

### 🚗 Vehículos (Autenticado)

#### Crear vehículo
```http
POST /api/vehicles
Authorization: Bearer <token>
Content-Type: application/json

{
  "brand": "Toyota",
  "model": "Corolla",
  "year": 2020,
  "price": 25000,
  "description": "Excelente estado, único dueño",
  "images": [
    "https://example.com/images/car1.jpg",
    "https://example.com/images/car2.jpg"
  ]
}
```

#### Actualizar vehículo
```http
PUT /api/vehicles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 23000,
  "description": "Precio negociable"
}
```

#### Eliminar vehículo
```http
DELETE /api/vehicles/:id
Authorization: Bearer <token>
```

#### Marcar como vendido
```http
PATCH /api/vehicles/:id/sold
Authorization: Bearer <token>
```

### ❓ Preguntas

#### Crear pregunta en un vehículo
```http
POST /api/vehicles/:vehicleId/questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "¿El vehículo tiene aire acondicionado?"
}
```

#### Obtener mis preguntas
```http
GET /api/my/questions
Authorization: Bearer <token>
```

### 💬 Respuestas

#### Responder una pregunta
```http
POST /api/questions/:questionId/answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Sí, tiene aire acondicionado funcionando perfectamente."
}
```

**Nota:** Solo el propietario del vehículo puede responder preguntas.

## 🔒 Seguridad

- **Autenticación JWT**: Todas las rutas protegidas requieren un token válido
- **Hash de contraseñas**: Las contraseñas se almacenan hasheadas con bcrypt
- **Validación de propiedad**: Los usuarios solo pueden modificar sus propios recursos
- **Validaciones en backend**: Todas las entradas son validadas

### Uso del Token

Incluir el token en el header de autorización:

```
Authorization: Bearer <token>
```

## 📝 Validaciones

### Usuario
- `username`: Requerido, único, mínimo 3 caracteres
- `password`: Requerido, mínimo 6 caracteres

### Vehículo
- `brand`: Requerido
- `model`: Requerido
- `year`: Requerido, número válido entre 1900 y año actual + 1
- `price`: Requerido, número positivo
- `description`: Opcional, máximo 1000 caracteres
- `images`: Opcional, array de URLs de imágenes (máximo 10)
- `status`: `available` o `sold` (default: `available`)

### Pregunta
- `text`: Requerido, máximo 500 caracteres

### Respuesta
- `text`: Requerido, máximo 500 caracteres

## 🎯 Reglas de Negocio

1. Un usuario puede tener múltiples vehículos
2. Un vehículo puede tener múltiples preguntas
3. Una pregunta pertenece a un usuario y un vehículo
4. Una respuesta pertenece a una pregunta
5. Solo el propietario del vehículo puede responder preguntas
6. Solo el propietario puede modificar/eliminar sus vehículos
7. Las preguntas no se pueden modificar

## 🗂️ Base de Datos

### Índices creados para optimización:

**User:**
- `username`

**Vehicle:**
- `brand`
- `price`
- `year`
- `status`
- `owner`
- Compuesto: `brand + year + price`

**Question:**
- `vehicle`
- `user`
- `createdAt`

**Answer:**
- `question`
- `user`

## 🧪 Testing

Para probar la API, puedes usar:

- **Postman**: Importa la colección de endpoints
- **Thunder Client**: Extensión de VS Code
- **cURL**: Comandos desde terminal

### Ejemplo con cURL:

```bash
# Registrar usuario
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# Listar vehículos
curl http://localhost:3000/api/vehicles

# Crear vehículo (requiere token)
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu-token>" \
  -d '{"brand":"Toyota","model":"Corolla","year":2020,"price":25000}'
```

## 🐛 Manejo de Errores

La API utiliza un sistema centralizado de manejo de errores que devuelve respuestas consistentes:

```json
{
  "success": false,
  "message": "Descripción del error"
}
```

### Códigos de estado HTTP:

- `200` - Éxito
- `201` - Creado
- `400` - Error en la solicitud (validación)
- `401` - No autenticado
- `403` - No autorizado (sin permisos)
- `404` - No encontrado
- `500` - Error interno del servidor

## 📦 Dependencias

```json
{
  "bcrypt": "^5.1.1",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.0.3"
}
```

## 👨‍💻 Desarrollo

### Scripts disponibles:

```bash
npm start      # Iniciar servidor en producción
npm run dev    # Iniciar servidor con nodemon (desarrollo)
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

ISC

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en el repositorio.

---

**Desarrollado con ❤️ usando Node.js y Express**
