const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicle.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const checkOwnership = require('../middlewares/checkOwnership.middleware');

/**
 * Rutas de vehículos
 * Base path: /api/vehicles
 */

// Rutas públicas
router.get('/', vehicleController.getVehicles.bind(vehicleController));
router.get('/:id', vehicleController.getVehicleById.bind(vehicleController));

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
