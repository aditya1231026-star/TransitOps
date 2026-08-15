import Vehicle from '../models/vehicleModel.js';

export const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({});
    res.status(200).json({ success: true, data: vehicles });
  } catch (error) { next(error); }
};

export const createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) { next(error); }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });
    res.status(200).json({ success: true, data: vehicle });
  } catch (error) { next(error); }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });
    await vehicle.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};
