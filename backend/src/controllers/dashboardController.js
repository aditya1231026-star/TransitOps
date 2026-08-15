import Vehicle from '../models/vehicleModel.js';
import Driver from '../models/driverModel.js';
import Trip from '../models/tripModel.js';

/**
 * @desc    Get dashboard metrics and counts
 * @route   GET /api/dashboard/stats
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const [vehicles, drivers, trips] = await Promise.all([
      Vehicle.find({}),
      Driver.find({}),
      Trip.find({})
    ]);

    // Active means not retired
    const activeVehicles = vehicles.filter(v => v.status !== 'Retired');
    const availableVehicles = vehicles.filter(v => v.status === 'Available');
    const inShopVehicles = vehicles.filter(v => v.status === 'In Shop');
    const activeTrips = trips.filter(t => t.status === 'Dispatched');
    const pendingTrips = trips.filter(t => t.status === 'Draft');
    const driversOnDuty = drivers.filter(d => d.status === 'On Trip');

    const vehiclesOnTrip = vehicles.filter(v => v.status === 'On Trip').length;
    const fleetUtilization = activeVehicles.length ? ((vehiclesOnTrip / activeVehicles.length) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      data: {
        activeVehicles: activeVehicles.length,
        availableVehicles: availableVehicles.length,
        inShopVehicles: inShopVehicles.length,
        activeTrips: activeTrips.length,
        pendingTrips: pendingTrips.length,
        driversOnDuty: driversOnDuty.length,
        fleetUtilization: parseFloat(fleetUtilization),
      },
    });
  } catch (error) {
    next(error);
  }
};

