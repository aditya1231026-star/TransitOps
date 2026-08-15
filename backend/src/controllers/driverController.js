import Driver from '../models/driverModel.js';

/**
 * @desc    Create a new driver
 * @route   POST /api/drivers
 * @access  Private
 */
export const createDriver = async (req, res, next) => {
  try {
    const {
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiry,
      contactNumber,
      safetyScore,
      status,
    } = req.body;

    // Check if license number already exists
    const driverExists = await Driver.findOne({ licenseNumber });
    if (driverExists) {
      res.status(400);
      throw new Error('Driver with this license number already registered');
    }

    const driver = await Driver.create({
      name,
      licenseNumber,
      licenseCategory,
      licenseExpiry,
      contactNumber,
      safetyScore,
      status,
    });

    res.status(201).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all drivers
 * @route   GET /api/drivers
 * @access  Private
 */
export const getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find({});
    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single driver by ID
 * @route   GET /api/drivers/:id
 * @access  Private
 */
export const getDriverById = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      res.status(404);
      throw new Error('Driver not found');
    }

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a driver
 * @route   PUT /api/drivers/:id
 * @access  Private
 */
export const updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      res.status(404);
      throw new Error('Driver not found');
    }

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedDriver,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a driver
 * @route   DELETE /api/drivers/:id
 * @access  Private
 */
export const deleteDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      res.status(404);
      throw new Error('Driver not found');
    }

    await Driver.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Driver deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
