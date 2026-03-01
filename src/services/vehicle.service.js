const Vehicle = require('../models/Vehicle');
const config = require('../config/config');

/**
 * Servicio de vehículos
 */
class VehicleService {
  /**
   * Obtener vehículos con filtros y paginación
   */
  async getVehicles(filters = {}) {
    const {
      brand,
      model,
      minYear,
      maxYear,
      minPrice,
      maxPrice,
      status,
      page = 1,
      limit = config.pagination.defaultPageSize,
    } = filters;

    // Construir query de filtrado
    const query = {};

    if (brand) {
      query.brand = { $regex: brand, $options: 'i' }; // Búsqueda case-insensitive
    }

    if (model) {
      query.model = { $regex: model, $options: 'i' };
    }

    if (minYear || maxYear) {
      query.year = {};
      if (minYear) query.year.$gte = parseInt(minYear);
      if (maxYear) query.year.$lte = parseInt(maxYear);
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (status) {
      query.status = status;
    }

    // Validar y limitar tamaño de página
    const pageSize = Math.min(parseInt(limit), config.pagination.maxPageSize);
    const pageNumber = Math.max(parseInt(page), 1);
    const skip = (pageNumber - 1) * pageSize;

    // Ejecutar query con paginación
    const [vehicles, total] = await Promise.all([
      Vehicle.find(query)
        .populate('owner', 'username')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize)
        .lean(),
      Vehicle.countDocuments(query),
    ]);

    return {
      data: vehicles,
      pagination: {
        total,
        page: pageNumber,
        pages: Math.ceil(total / pageSize),
        limit: pageSize,
      },
    };
  }

  /**
   * Obtener vehículo por ID
   */
  async getVehicleById(id) {
    const vehicle = await Vehicle.findById(id).populate('owner', 'username').lean();

    if (!vehicle) {
      const error = new Error('Vehículo no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    return vehicle;
  }

  /**
   * Crear nuevo vehículo
   */
  async createVehicle(vehicleData, userId) {
    const vehicle = await Vehicle.create({
      ...vehicleData,
      owner: userId,
    });

    return await vehicle.populate('owner', 'username');
  }

  /**
   * Actualizar vehículo
   */
  async updateVehicle(id, vehicleData, userId) {
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      const error = new Error('Vehículo no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    // Verificar propiedad
    if (vehicle.owner.toString() !== userId.toString()) {
      const error = new Error('No tienes permiso para realizar esta acción.');
      error.statusCode = 403;
      throw error;
    }

    // Actualizar campos permitidos
    const allowedUpdates = ['brand', 'model', 'year', 'price', 'description'];
    allowedUpdates.forEach((field) => {
      if (vehicleData[field] !== undefined) {
        vehicle[field] = vehicleData[field];
      }
    });

    await vehicle.save();
    return await vehicle.populate('owner', 'username');
  }

  /**
   * Eliminar vehículo
   */
  async deleteVehicle(id, userId) {
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      const error = new Error('Vehículo no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    // Verificar propiedad
    if (vehicle.owner.toString() !== userId.toString()) {
      const error = new Error('No tienes permiso para realizar esta acción.');
      error.statusCode = 403;
      throw error;
    }

    await vehicle.deleteOne();
    return { message: 'Vehículo eliminado correctamente.' };
  }

  /**
   * Marcar vehículo como vendido
   */
  async markAsSold(id, userId) {
    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      const error = new Error('Vehículo no encontrado.');
      error.statusCode = 404;
      throw error;
    }

    // Verificar propiedad
    if (vehicle.owner.toString() !== userId.toString()) {
      const error = new Error('No tienes permiso para realizar esta acción.');
      error.statusCode = 403;
      throw error;
    }

    vehicle.status = 'sold';
    await vehicle.save();

    return await vehicle.populate('owner', 'username');
  }
}

module.exports = new VehicleService();
