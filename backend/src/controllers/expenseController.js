import Expense from '../models/expenseModel.js';

export const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({}).populate('vehicle', 'registrationNumber model type');
    res.status(200).json({ success: true, data: expenses });
  } catch (error) { next(error); }
};

export const createExpense = async (req, res, next) => {
  try {
    const expense = await Expense.create(req.body);
    const populatedExpense = await Expense.findById(expense._id).populate('vehicle', 'registrationNumber model type');
    res.status(201).json({ success: true, data: populatedExpense });
  } catch (error) { next(error); }
};

export const updateExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate('vehicle', 'registrationNumber model type');
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
    res.status(200).json({ success: true, data: expense });
  } catch (error) { next(error); }
};

export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });
    await expense.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) { next(error); }
};
