import Trip from '../models/tripModel.js';
import Expense from '../models/expenseModel.js';
import Maintenance from '../models/maintenanceModel.js';
import Vehicle from '../models/vehicleModel.js';

export const getReportsData = async (req, res, next) => {
  try {
    const [trips, expenses, maintenance, vehicles] = await Promise.all([
      Trip.find({}),
      Expense.find({}),
      Maintenance.find({}),
      Vehicle.find({})
    ]);

    const activeVehicles = vehicles.filter(v => v.status !== 'Retired');
    const vehiclesOnTrip = vehicles.filter(v => v.status === 'On Trip').length;
    const fleetUtilization = activeVehicles.length ? ((vehiclesOnTrip / activeVehicles.length) * 100).toFixed(1) : 0;

    const vehicleStats = vehicles.map(v => {
      const vTrips = trips.filter(t => t.vehicle.toString() === v._id.toString());
      const vExpenses = expenses.filter(e => e.vehicle && e.vehicle.toString() === v._id.toString());
      const vMaint = maintenance.filter(m => m.vehicle.toString() === v._id.toString());

      const totalDistance = vTrips.reduce((sum, t) => sum + (t.finalOdometer || t.plannedDistance || 0), 0);
      const totalFuelConsumed = vTrips.reduce((sum, t) => sum + (t.fuelConsumed || 0), 0);
      
      const fuelEfficiency = totalFuelConsumed > 0 ? (totalDistance / totalFuelConsumed).toFixed(2) : 0;

      const totalFuelCost = vExpenses.filter(e => e.category === 'Fuel').reduce((sum, e) => sum + (e.amount || 0), 0);
      const totalMaintenanceCost = vMaint.reduce((sum, m) => sum + (m.cost || 0), 0);
      const operationalCost = totalFuelCost + totalMaintenanceCost;

      const tripRevenues = vTrips.reduce((sum, t) => sum + (t.freightCharge || 0), 0);
      
      const roi = v.acquisitionCost > 0 ? (((tripRevenues - operationalCost) / v.acquisitionCost) * 100).toFixed(2) : 0;

      return {
        vehicleId: v._id,
        registrationNumber: v.registrationNumber,
        model: v.model,
        type: v.type,
        fuelEfficiency: parseFloat(fuelEfficiency),
        operationalCost,
        roi: parseFloat(roi),
      };
    });

    res.status(200).json({
      success: true,
      data: {
        fleetUtilization: parseFloat(fleetUtilization),
        vehicleStats,
      }
    });
  } catch (error) { next(error); }
};
