const Vehicle = require('../models/Vehicle');

/**
 * Middleware para verificar que el usuario es dueño del vehículo
 */
const checkVehicleOwnership = async (req, res, next) => {
  try {
    const vehicleId = req.params.id || req.params.vehicleId;
    const vehicle = await Vehicle.findById(vehicleId);

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: 'Vehículo no encontrado.',
      });
    }

    // Verificar que el usuario es el propietario
    if (vehicle.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para realizar esta acción.',
      });
    }

    // Pasar el vehículo al siguiente middleware/controlador
    req.vehicle = vehicle;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = checkVehicleOwnership;
