# Implementación de Validación de Identidad - Fase 1

## 📋 Archivos Creados

### 1. `src/utils/calculateAge.js` ✅
Utilidades para calcular edad y verificar mayoría de edad.

**Funciones exportadas:**
- `calculateAge(birthDate)` - Retorna la edad en años
- `isAdult(birthDate)` - Retorna true si es mayor de 18 años

---

### 2. `src/services/identityService.js` ✅
Lógica de negocio para validación de identidad.

**Características:**
- Mock temporal del padrón electoral (2 registros de prueba)
- Normalización de cédula (quita espacios y guiones)
- Verificación de mayoría de edad
- Respuestas estructuradas según especificación

**Métodos:**
- `validateIdentity(cedula)` - Valida cédula y retorna resultado

---

### 3. `src/controllers/identityController.js` ✅
Manejo de solicitudes HTTP.

**Validaciones:**
- Verifica que cédula esté en el body
- Valida que sea string
- Valida que no esté vacía
- Maneja errores con try/catch

**Endpoints:**
- `POST /api/identity/validate`

---

### 4. `src/routes/identityRoutes.js` ✅
Definición de rutas de identidad.

**Rutas:**
- `POST /identity/validate` (accesible como `/api/identity/validate`)

---

## 📝 Archivo Modificado

### `src/routes/index.js` ✅
Se agregó:
```javascript
const identityRoutes = require('./identityRoutes');
// ...
router.use('/identity', identityRoutes);
```

---

## 🧪 Cómo Probar con Postman

### Instalación (si no tiene Postman):
1. Descargar desde [postman.com](https://www.postman.com/downloads/)
2. Instalar y abrir

### Configuring el Entorno:

**1. Crear una Nueva Request:**
- Clic en "New" → "HTTP Request"
- O presionar `Ctrl + Alt + N`

**2. URL Base:**
```
http://localhost:5000
```
(Ajusta el puerto si tu servidor está en otro)

---

## 🧪 Test Cases

### ✅ Test 1: Validación Exitosa (Mayor de edad)

**Método:** `POST`
**URL:** `http://localhost:5000/api/identity/validate`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "cedula": "123456789"
}
```

**Respuesta Esperada (200 OK):**
```json
{
  "valid": true,
  "isAdult": true,
  "cedula": "123456789",
  "firstName": "ROBERT",
  "lastName1": "QUESADA",
  "lastName2": "PEREZ",
  "birthDate": "2001-03-10",
  "message": "Identidad validada correctamente"
}
```

---

### ⛔ Test 2: Menor de Edad

**Método:** `POST`
**URL:** `http://localhost:5000/api/identity/validate`

**Body (JSON):**
```json
{
  "cedula": "111111111"
}
```

**Respuesta Esperada (200 OK):**
```json
{
  "valid": false,
  "isAdult": false,
  "cedula": "111111111",
  "firstName": "JUAN",
  "lastName1": "PEREZ",
  "lastName2": "LOPEZ",
  "birthDate": "2010-01-15",
  "message": "Debes ser mayor de edad para registrarte"
}
```

---

### 🔍 Test 3: Cédula No Existe

**Método:** `POST`
**URL:** `http://localhost:5000/api/identity/validate`

**Body (JSON):**
```json
{
  "cedula": "999999999"
}
```

**Respuesta Esperada (200 OK):**
```json
{
  "valid": false,
  "message": "La cédula no existe en el padrón electoral"
}
```

---

### ❌ Test 4: Validación Missing (Sin cédula)

**Método:** `POST`
**URL:** `http://localhost:5000/api/identity/validate`

**Body (JSON):**
```json
{}
```

**Respuesta Esperada (400 Bad Request):**
```json
{
  "valid": false,
  "message": "La cédula es requerida."
}
```

---

### ❌ Test 5: Cédula Vacía

**Método:** `POST`
**URL:** `http://localhost:5000/api/identity/validate`

**Body (JSON):**
```json
{
  "cedula": "   "
}
```

**Respuesta Esperada (400 Bad Request):**
```json
{
  "valid": false,
  "message": "La cédula no puede estar vacía."
}
```

---

### ✅ Test 6: Cédula con Formato (espacios/guiones)

**Método:** `POST`
**URL:** `http://localhost:5000/api/identity/validate`

**Body (JSON):**
```json
{
  "cedula": "123 456-789"
}
```

**Respuesta Esperada (200 OK):**
```json
{
  "valid": true,
  "isAdult": true,
  "cedula": "123456789",
  "firstName": "ROBERT",
  "lastName1": "QUESADA",
  "lastName2": "PEREZ",
  "birthDate": "2001-03-10",
  "message": "Identidad validada correctamente"
}
```
*(La cédula se normaliza correctamente)*

---

## 📊 Resumen de Cambios

| Archivo | Acción | Descripción |
|---------|--------|-------------|
| `src/utils/calculateAge.js` | ✅ CREADO | Utilidades de cálculo de edad |
| `src/services/identityService.js` | ✅ CREADO | Servicio con lógica de validación |
| `src/controllers/identityController.js` | ✅ CREADO | Controlador HTTP |
| `src/routes/identityRoutes.js` | ✅ CREADO | Definición de rutas |
| `src/routes/index.js` | ✏️ MODIFICADO | Se registró la nueva ruta |

---

## 🔄 Próximas Fases

1. **Fase 2**: Conectar a API real del padrón electoral
2. **Fase 3**: Integrar validación en flujo de registro
3. **Fase 4**: Guardar estados de validación en modelo User

---

## 📌 Notas Importantes

- ✅ No se modificó el modelo User
- ✅ No se modificó el flujo de registro
- ✅ Se respeta la arquitectura existente (routes/controllers/services)
- ✅ Se usa async/await y try/catch
- ✅ Mock temporal incluido para testing
- ✅ Listo para conectar API real posteriormente

---

## 🚀 Para Iniciar el Servidor

```bash
npm start
```

El servidor debería estar escuchando en `http://localhost:5000`

---

**¿Listo para probar? Usa los test cases anteriores en Postman** ✨
