import mongoose from 'mongoose';

const maintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    serviceDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    type: {
      type: String,
      enum: ['Routine', 'Repair', 'Inspection'],
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Scheduled', 'In Progress', 'Completed'],
      default: 'Scheduled',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Maintenance = mongoose.model('Maintenance', maintenanceSchema);

export default Maintenance;
