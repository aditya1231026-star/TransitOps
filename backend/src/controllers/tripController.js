import Trip from '../models/tripModel.js';
import Vehicle from '../models/vehicleModel.js';
import Driver from '../models/driverModel.js';

export const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({}).populate('vehicle').populate('driver');
    res.status(200).json({ success: true, data: trips });
  } catch (error) { next(error); }
};

export const createTrip = async (req, res, next) => {
  try {
    const { vehicle, driver, cargoWeight, status } = req.body;
    
    // Fetch related entities
    const v = await Vehicle.findById(vehicle);
    const d = await Driver.findById(driver);

    if (!v) throw new Error('Vehicle not found');
    if (!d) throw new Error('Driver not found');

    // Validations (only if dispatching)
    if (status === 'Dispatched') {
      if (cargoWeight > v.maxLoadCapacity) throw new Error('Cargo weight exceeds vehicle capacity');
      if (d.status === 'Suspended') throw new Error('Driver is suspended');
      if (new Date(d.licenseExpiry) < new Date()) throw new Error('Driver license is expired');
      if (v.status === 'On Trip' || d.status === 'On Trip') throw new Error('Vehicle or Driver is already on a trip');
      if (v.status === 'In Shop' || v.status === 'Retired') throw new Error(`Vehicle is ${v.status}`);
    }

    const trip = await Trip.create(req.body);

    // State transition
    if (status === 'Dispatched') {
      v.status = 'On Trip'; await v.save();
      d.status = 'On Trip'; await d.save();
    }

    const populatedTrip = await Trip.findById(trip._id).populate('vehicle').populate('driver');
    res.status(201).json({ success: true, data: populatedTrip });
  } catch (error) { 
    res.status(400);
    next(error); 
  }
};

export const updateTrip = async (req, res, next) => {
  try {
    const { status, finalOdometer, fuelConsumed } = req.body;
    const trip = await Trip.findById(req.params.id).populate('vehicle').populate('driver');
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });

    const v = await Vehicle.findById(trip.vehicle._id || trip.vehicle);
    const d = await Driver.findById(trip.driver._id || trip.driver);

    const oldStatus = trip.status;
    
    // Check transitions
    if (oldStatus !== 'Dispatched' && status === 'Dispatched') {
      // Validate dispatch rules
      if (trip.cargoWeight > v.maxLoadCapacity) throw new Error('Cargo weight exceeds vehicle capacity');
      if (d.status === 'Suspended') throw new Error('Driver is suspended');
      if (new Date(d.licenseExpiry) < new Date()) throw new Error('Driver license is expired');
      if (v.status === 'On Trip' || d.status === 'On Trip') throw new Error('Vehicle or Driver is already on a trip');
      if (v.status === 'In Shop' || v.status === 'Retired') throw new Error(`Vehicle is ${v.status}`);
      
      v.status = 'On Trip'; await v.save();
      d.status = 'On Trip'; await d.save();
    }
    else if (oldStatus === 'Dispatched' && status === 'Completed') {
      if (finalOdometer == null || fuelConsumed == null) throw new Error('Final odometer and fuel consumed are required to complete a trip');
      v.odometer = finalOdometer;
      v.status = 'Available'; await v.save();
      d.status = 'Available'; await d.save();
    }
    else if (oldStatus === 'Dispatched' && status === 'Cancelled') {
      v.status = 'Available'; await v.save();
      d.status = 'Available'; await d.save();
    }

    // Apply updates
    Object.assign(trip, req.body);
    await trip.save();
    
    const updatedTrip = await Trip.findById(trip._id).populate('vehicle').populate('driver');
    res.status(200).json({ success: true, data: updatedTrip });
  } catch (error) { 
    res.status(400);
    next(error); 
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ success: false, error: 'Trip not found' });
    
    // If deleted while dispatched, free resources
    if (trip.status === 'Dispatched') {
      await Vehicle.findByIdAndUpdate(trip.vehicle, { status: 'Available' });
      await Driver.findByIdAndUpdate(trip.driver, { status: 'Available' });
    }

    await trip.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};
