const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const questionController = require('../controllers/question.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const checkOwnership = require('../middlewares/checkOwnership.middleware');

/**
 * Rutas de vehículos
 * Base path: /api/vehicles
 */

// Rutas públicas
router.get('/', vehicleController.getVehicles.bind(vehicleController));
router.get('/:id', vehicleController.getVehicleById.bind(vehicleController));

// Preguntas de un vehículo (privadas)
// GET /api/vehicles/:vehicleId/questions
router.get(
  '/:vehicleId/questions',
  authMiddleware,
  questionController.getVehicleQuestions.bind(questionController)
);

// Crear pregunta en un vehículo
// POST /api/vehicles/:vehicleId/questions
router.post(
  '/:vehicleId/questions',
  authMiddleware,
  questionController.createQuestion.bind(questionController)
);

// Rutas protegidas (requieren autenticación)
router.post('/', authMiddleware, vehicleController.createVehicle.bind(vehicleController));

router.put(
  '/:id',
  authMiddleware,
  checkOwnership,
  vehicleController.updateVehicle.bind(vehicleController)
);

router.delete(
  '/:id',
  authMiddleware,
  checkOwnership,
  vehicleController.deleteVehicle.bind(vehicleController)
);

router.patch(
  '/:id/sold',
  authMiddleware,
  checkOwnership,
  vehicleController.markAsSold.bind(vehicleController)
);

module.exports = router;
