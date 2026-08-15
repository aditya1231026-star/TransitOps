import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a driver name'],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please add a license number'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    licenseCategory: {
      type: String,
      required: [true, 'Please add a license category'],
      trim: true,
    },
    licenseExpiry: {
      type: Date,
      required: [true, 'Please add a license expiry date'],
    },
    contactNumber: {
      type: String,
      required: [true, 'Please add a contact number'],
      trim: true,
    },
    safetyScore: {
      type: Number,
      default: 100,
      min: [0, 'Safety score cannot be less than 0'],
      max: [100, 'Safety score cannot exceed 100'],
    },
    status: {
      type: String,
      enum: ['Available', 'On Trip', 'Off Duty', 'Suspended'],
      default: 'Available',
    },
  },
  {
    timestamps: true,
  }
);

const Driver = mongoose.model('Driver', driverSchema);

export default Driver;
