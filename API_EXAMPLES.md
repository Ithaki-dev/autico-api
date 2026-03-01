# 📄 Ejemplos de Respuestas JSON de la API

Este archivo contiene ejemplos reales de las respuestas JSON que devuelve la API.

---

## 🔐 AUTH - Registro

### Request
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "juanperez",
  "password": "password123"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente.",
  "data": {
    "id": "65f8a3b2c1d4e5f6a7b8c9d0",
    "username": "juanperez"
  }
}
```

---

## 🔐 AUTH - Login

### Request
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "juanperez",
  "password": "password123"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Inicio de sesión exitoso.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1ZjhhM2IyYzFkNGU1ZjZhN2I4YzlkMCIsImlhdCI6MTcwOTY0OTYwMCwiZXhwIjoxNzEwMjU0NDAwfQ.xYz123abc456def789ghi012jkl345mno678pqr",
    "user": {
      "id": "65f8a3b2c1d4e5f6a7b8c9d0",
      "username": "juanperez"
    }
  }
}
```

---

## 🚗 VEHICLES - Listar con filtros y paginación

### Request
```http
GET /api/vehicles?brand=Toyota&minPrice=15000&maxPrice=30000&status=available&page=1&limit=10
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f8b1a2c3d4e5f6a7b8c9d1",
      "brand": "Toyota",
      "model": "Corolla",
      "year": 2020,
      "price": 25000,
      "status": "available",
      "description": "Excelente estado, único dueño, mantenimientos al día",
      "owner": {
        "_id": "65f8a3b2c1d4e5f6a7b8c9d0",
        "username": "juanperez"
      },
      "createdAt": "2024-03-15T14:30:00.000Z",
      "updatedAt": "2024-03-15T14:30:00.000Z"
    },
    {
      "_id": "65f8b2a3c4d5e6f7a8b9c0d2",
      "brand": "Toyota",
      "model": "RAV4",
      "year": 2019,
      "price": 28000,
      "status": "available",
      "description": "SUV espaciosa, perfecta para familias",
      "owner": {
        "_id": "65f8a4b3c2d5e6f7a8b9c0d1",
        "username": "mariagomez"
      },
      "createdAt": "2024-03-16T10:15:00.000Z",
      "updatedAt": "2024-03-16T10:15:00.000Z"
    },
    {
      "_id": "65f8b3a4c5d6e7f8a9b0c1d3",
      "brand": "Toyota",
      "model": "Camry",
      "year": 2021,
      "price": 29500,
      "status": "available",
      "description": "Sedán de lujo, full equipo",
      "owner": {
        "_id": "65f8a5b4c3d6e7f8a9b0c1d2",
        "username": "carlosrodriguez"
      },
      "createdAt": "2024-03-17T09:45:00.000Z",
      "updatedAt": "2024-03-17T09:45:00.000Z"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 1,
    "pages": 1,
    "limit": 10
  }
}
```

---

## 🚗 VEHICLES - Obtener por ID

### Request
```http
GET /api/vehicles/65f8b1a2c3d4e5f6a7b8c9d1
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "_id": "65f8b1a2c3d4e5f6a7b8c9d1",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "price": 25000,
    "status": "available",
    "description": "Excelente estado, único dueño, mantenimientos al día",
    "owner": {
      "_id": "65f8a3b2c1d4e5f6a7b8c9d0",
      "username": "juanperez"
    },
    "createdAt": "2024-03-15T14:30:00.000Z",
    "updatedAt": "2024-03-15T14:30:00.000Z"
  }
}
```

---

## 🚗 VEHICLES - Crear (requiere autenticación)

### Request
```http
POST /api/vehicles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "brand": "Honda",
  "model": "Civic",
  "year": 2022,
  "price": 32000,
  "description": "Como nuevo, 15,000 km recorridos"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Vehículo creado exitosamente.",
  "data": {
    "_id": "65f8b4a5c6d7e8f9a0b1c2d4",
    "brand": "Honda",
    "model": "Civic",
    "year": 2022,
    "price": 32000,
    "status": "available",
    "description": "Como nuevo, 15,000 km recorridos",
    "owner": {
      "_id": "65f8a3b2c1d4e5f6a7b8c9d0",
      "username": "juanperez"
    },
    "createdAt": "2024-03-18T11:20:00.000Z",
    "updatedAt": "2024-03-18T11:20:00.000Z"
  }
}
```

---

## 🚗 VEHICLES - Actualizar (requiere ser el dueño)

### Request
```http
PUT /api/vehicles/65f8b1a2c3d4e5f6a7b8c9d1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "price": 23500,
  "description": "Precio reducido! Excelente estado, único dueño"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Vehículo actualizado exitosamente.",
  "data": {
    "_id": "65f8b1a2c3d4e5f6a7b8c9d1",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "price": 23500,
    "status": "available",
    "description": "Precio reducido! Excelente estado, único dueño",
    "owner": {
      "_id": "65f8a3b2c1d4e5f6a7b8c9d0",
      "username": "juanperez"
    },
    "createdAt": "2024-03-15T14:30:00.000Z",
    "updatedAt": "2024-03-18T12:05:00.000Z"
  }
}
```

---

## 🚗 VEHICLES - Marcar como vendido

### Request
```http
PATCH /api/vehicles/65f8b1a2c3d4e5f6a7b8c9d1/sold
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Vehículo marcado como vendido.",
  "data": {
    "_id": "65f8b1a2c3d4e5f6a7b8c9d1",
    "brand": "Toyota",
    "model": "Corolla",
    "year": 2020,
    "price": 23500,
    "status": "sold",
    "description": "Precio reducido! Excelente estado, único dueño",
    "owner": {
      "_id": "65f8a3b2c1d4e5f6a7b8c9d0",
      "username": "juanperez"
    },
    "createdAt": "2024-03-15T14:30:00.000Z",
    "updatedAt": "2024-03-19T16:30:00.000Z"
  }
}
```

---

## 🚗 VEHICLES - Eliminar

### Request
```http
DELETE /api/vehicles/65f8b1a2c3d4e5f6a7b8c9d1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Vehículo eliminado correctamente."
}
```

---

## ❓ QUESTIONS - Crear pregunta

### Request
```http
POST /api/vehicles/65f8b2a3c4d5e6f7a8b9c0d2/questions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "text": "¿El vehículo ha tenido algún accidente?"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Pregunta creada exitosamente.",
  "data": {
    "_id": "65f8b5a6c7d8e9f0a1b2c3d5",
    "vehicle": {
      "_id": "65f8b2a3c4d5e6f7a8b9c0d2",
      "brand": "Toyota",
      "model": "RAV4",
      "year": 2019
    },
    "user": {
      "_id": "65f8a3b2c1d4e5f6a7b8c9d0",
      "username": "juanperez"
    },
    "text": "¿El vehículo ha tenido algún accidente?",
    "createdAt": "2024-03-18T13:45:00.000Z",
    "updatedAt": "2024-03-18T13:45:00.000Z"
  }
}
```

---

## ❓ QUESTIONS - Obtener mis preguntas

### Request
```http
GET /api/my/questions
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "_id": "65f8b5a6c7d8e9f0a1b2c3d5",
      "vehicle": {
        "_id": "65f8b2a3c4d5e6f7a8b9c0d2",
        "brand": "Toyota",
        "model": "RAV4",
        "year": 2019,
        "price": 28000
      },
      "user": {
        "_id": "65f8a3b2c1d4e5f6a7b8c9d0",
        "username": "juanperez"
      },
      "text": "¿El vehículo ha tenido algún accidente?",
      "createdAt": "2024-03-18T13:45:00.000Z",
      "updatedAt": "2024-03-18T13:45:00.000Z"
    },
    {
      "_id": "65f8b6a7c8d9e0f1a2b3c4d6",
      "vehicle": {
        "_id": "65f8b3a4c5d6e7f8a9b0c1d3",
        "brand": "Toyota",
        "model": "Camry",
        "year": 2021,
        "price": 29500
      },
      "user": {
        "_id": "65f8a3b2c1d4e5f6a7b8c9d0",
        "username": "juanperez"
      },
      "text": "¿Acepta financiamiento?",
      "createdAt": "2024-03-18T14:10:00.000Z",
      "updatedAt": "2024-03-18T14:10:00.000Z"
    }
  ]
}
```

---

## 💬 ANSWERS - Crear respuesta

### Request
```http
POST /api/questions/65f8b5a6c7d8e9f0a1b2c3d5/answer
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "text": "No, el vehículo nunca ha tenido accidentes. Siempre se ha mantenido en excelente condición."
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Respuesta creada exitosamente.",
  "data": {
    "_id": "65f8b7a8c9d0e1f2a3b4c5d7",
    "question": {
      "_id": "65f8b5a6c7d8e9f0a1b2c3d5",
      "vehicle": "65f8b2a3c4d5e6f7a8b9c0d2",
      "user": "65f8a3b2c1d4e5f6a7b8c9d0",
      "text": "¿El vehículo ha tenido algún accidente?",
      "createdAt": "2024-03-18T13:45:00.000Z",
      "updatedAt": "2024-03-18T13:45:00.000Z"
    },
    "user": {
      "_id": "65f8a4b3c2d5e6f7a8b9c0d1",
      "username": "mariagomez"
    },
    "text": "No, el vehículo nunca ha tenido accidentes. Siempre se ha mantenido en excelente condición.",
    "createdAt": "2024-03-18T15:20:00.000Z",
    "updatedAt": "2024-03-18T15:20:00.000Z"
  }
}
```

---

## ⚠️ ERRORES

### Error 400 - Validación

```json
{
  "success": false,
  "message": "Error de validación",
  "errors": [
    "La marca es requerida",
    "El precio debe ser positivo"
  ]
}
```

### Error 401 - No autenticado

```json
{
  "success": false,
  "message": "Token no proporcionado. Acceso denegado."
}
```

### Error 403 - No autorizado

```json
{
  "success": false,
  "message": "No tienes permiso para realizar esta acción."
}
```

### Error 404 - No encontrado

```json
{
  "success": false,
  "message": "Vehículo no encontrado."
}
```

### Error 500 - Error del servidor

```json
{
  "success": false,
  "message": "Error interno del servidor."
}
```

---

## 🔍 Health Check

### Request
```http
GET /health
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "API funcionando correctamente.",
  "timestamp": "2024-03-18T16:30:00.000Z"
}
```
