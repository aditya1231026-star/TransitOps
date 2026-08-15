import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: false, // Optional, since some expenses might be general
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    category: {
      type: String,
      enum: ['Fuel', 'Toll', 'Maintenance', 'Other'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    liters: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Paid'],
      default: 'Pending',
    },
    loggedBy: {
      type: String,
      trim: true,
      default: 'System',
    },
  },
  {
    timestamps: true,
  }
);

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
