import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Van', 'Box Truck', 'Flatbed', 'Reefer'],
      required: true,
    },
    maxLoadCapacity: {
      type: Number,
      required: true,
      min: 0,
    },
    odometer: {
      type: Number,
      required: true,
      min: 0,
    },
    acquisitionCost: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
