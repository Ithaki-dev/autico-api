const vehicleService = require('../services/vehicle.service');

/**
 * Controlador de vehículos
 */
class VehicleController {
  /**
   * Obtener todos los vehículos con filtros
   * GET /api/vehicles
   */
  async getVehicles(req, res, next) {
    try {
      const filters = req.query;
      const result = await vehicleService.getVehicles(filters);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Obtener vehículo por ID
   * GET /api/vehicles/:id
   */
  async getVehicleById(req, res, next) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.getVehicleById(id);

      res.status(200).json({
        success: true,
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Crear nuevo vehículo
   * POST /api/vehicles
   */
  async createVehicle(req, res, next) {
    try {
      const vehicleData = req.body;
      const userId = req.user.id;

      const vehicle = await vehicleService.createVehicle(vehicleData, userId);

      res.status(201).json({
        success: true,
        message: 'Vehículo creado exitosamente.',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Actualizar vehículo
   * PUT /api/vehicles/:id
   */
  async updateVehicle(req, res, next) {
    try {
      const { id } = req.params;
      const vehicleData = req.body;
      const userId = req.user.id;

      const vehicle = await vehicleService.updateVehicle(id, vehicleData, userId);

      res.status(200).json({
        success: true,
        message: 'Vehículo actualizado exitosamente.',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Eliminar vehículo
   * DELETE /api/vehicles/:id
   */
  async deleteVehicle(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await vehicleService.deleteVehicle(id, userId);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marcar vehículo como vendido
   * PATCH /api/vehicles/:id/sold
   */
  async markAsSold(req, res, next) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const vehicle = await vehicleService.markAsSold(id, userId);

      res.status(200).json({
        success: true,
        message: 'Vehículo marcado como vendido.',
        data: vehicle,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VehicleController();
