import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    tripNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    source: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    cargoWeight: {
      type: Number,
      required: true,
      min: 0,
    },
    plannedDistance: {
      type: Number,
      required: true,
      min: 0,
    },
    finalOdometer: {
      type: Number,
      default: null,
    },
    fuelConsumed: {
      type: Number,
      default: null,
    },
    freightCharge: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
      default: 'Draft',
    },
  },
  {
    timestamps: true,
  }
);

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
