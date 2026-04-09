# Autico API

API REST para una plataforma de venta de vehiculos.

## Stack

- Node.js
- Express
- MongoDB + Mongoose
- JWT
- Passport + Google OAuth2

## Estructura del proyecto

- src/config: configuracion general, DB y Passport
- src/controllers: controladores HTTP
- src/middlewares: auth, ownership, manejo de errores, token temporal Google
- src/models: modelos de MongoDB
- src/routes: rutas agrupadas por modulo
- src/services: logica de negocio
- src/app.js: inicializacion de Express
- src/server.js: arranque del servidor

## Instalacion

1. Instalar dependencias

```bash
npm install
```

2. Crear archivo .env tomando como base .env.example

3. Iniciar servidor en desarrollo

```bash
npm run dev
```

## Variables de entorno

Minimas requeridas:

- PORT
- NODE_ENV
- MONGODB_URI
- JWT_SECRET
- JWT_EXPIRES_IN
- JWT_TEMP_SECRET
- JWT_TEMP_EXPIRES_IN
- PADRON_API_URL

Para Google OAuth2:

- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- GOOGLE_CALLBACK_URL
- GOOGLE_FRONTEND_REDIRECT_URL

## Endpoints principales

Health:

- GET /health

Auth local:

- POST /api/auth/register
- POST /api/auth/login

Auth Google:

- GET /api/auth/google
- GET /api/auth/google/callback
- POST /api/auth/google/complete-registration

Identidad:

- POST /api/identity/validate

Vehiculos:

- GET /api/vehicles
- GET /api/vehicles/:id
- POST /api/vehicles
- PUT /api/vehicles/:id
- DELETE /api/vehicles/:id
- PATCH /api/vehicles/:id/sold

Preguntas y respuestas:

- GET /api/my/questions
- GET /api/vehicles/:vehicleId/questions
- POST /api/vehicles/:vehicleId/questions
- POST /api/questions/:questionId/answer

## Flujo Google OAuth2

1. El frontend redirige a GET /api/auth/google
2. Google vuelve a GET /api/auth/google/callback
3. Si el usuario esta completo:
   - retorna token final
   - retorna user publico minimo (id, username, name, email)
4. Si el usuario esta incompleto:
   - retorna tempToken
   - frontend solicita cedula y llama POST /api/auth/google/complete-registration
5. Al completar registro se retorna token final y user completo

## Limpieza aplicada en esta auditoria

- Se eliminaron documentos obsoletos y no referenciados.
- Se removio utilitario sin uso.
- Se elimino dependencia no utilizada de sesiones.
- Se simplifico Passport para modo stateless.

## Notas

- El backend opera con JWT stateless.
- El flujo tradicional de login/registro se mantiene compatible.
- Para produccion, rota y protege secretos en variables de entorno.
