import Maintenance from '../models/maintenanceModel.js';
import Vehicle from '../models/vehicleModel.js';

export const getMaintenanceLogs = async (req, res, next) => {
  try {
    const logs = await Maintenance.find({}).populate('vehicle', 'registrationNumber model type');
    res.status(200).json({ success: true, data: logs });
  } catch (error) { next(error); }
};

export const createMaintenanceLog = async (req, res, next) => {
  try {
    const log = await Maintenance.create(req.body);
    
    // Set vehicle status to In Shop if Scheduled or In Progress
    if (log.status === 'Scheduled' || log.status === 'In Progress') {
      await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'In Shop' });
    }

    const populatedLog = await Maintenance.findById(log._id).populate('vehicle', 'registrationNumber model type');
    res.status(201).json({ success: true, data: populatedLog });
  } catch (error) { next(error); }
};

export const updateMaintenanceLog = async (req, res, next) => {
  try {
    const log = await Maintenance.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!log) return res.status(404).json({ success: false, error: 'Maintenance log not found' });
    
    // Handle vehicle status
    if (log.status === 'Completed') {
      const v = await Vehicle.findById(log.vehicle);
      if (v && v.status !== 'Retired') {
        v.status = 'Available';
        await v.save();
      }
    } else {
      await Vehicle.findByIdAndUpdate(log.vehicle, { status: 'In Shop' });
    }

    const populatedLog = await Maintenance.findById(log._id).populate('vehicle', 'registrationNumber model type');
    res.status(200).json({ success: true, data: populatedLog });
  } catch (error) { next(error); }
};

export const deleteMaintenanceLog = async (req, res, next) => {
  try {
    const log = await Maintenance.findById(req.params.id);
    if (!log) return res.status(404).json({ success: false, error: 'Maintenance log not found' });
    
    // If we delete an active maintenance log, free the vehicle
    if (log.status !== 'Completed') {
      const v = await Vehicle.findById(log.vehicle);
      if (v && v.status !== 'Retired') {
        v.status = 'Available';
        await v.save();
      }
    }

    await log.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};
