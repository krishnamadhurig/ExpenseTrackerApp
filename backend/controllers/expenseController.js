// controllers/expenseController.js
//it handles the main logic between API requests and database.
const Expense = require("../models/expense");
const User = require("../models/user");
const { getCategory } = require("../utils/ai");

exports.addExpense = async (req, res) => {
  try {
    const { amount, description } = req.body;
    if (!amount || !description)
      return res.status(400).json({ message: "All fields required" });

    // AI category
    const category = await getCategory(description);

    const expense = await Expense.create({
      amount,
      description,
      category,
      UserId: req.user.id
    });

    // Update user's total
    const user = await User.findByPk(req.user.id);
    user.totalAmount += Number(amount);
    await user.save();

    res.json({ expense, total: user.totalAmount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add expense" });
  }
};
//get expenses
exports.getExpenses = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = Math.min(parseInt(req.query.pageSize) || 10, 50);

        const offset = (page - 1) * pageSize;

        const { count, rows } = await Expense.findAndCountAll({
            where: { UserId: req.user.id },
            limit: pageSize,
            offset,
            order: [["createdAt", "DESC"]]
        });

        const totalPages = Math.ceil(count / pageSize) || 1;

        // Edge case: page overflow
        if (page > totalPages) {
            return res.json({
                expenses: [],
                currentPage: totalPages,
                totalPages,
                totalExpenses: count
            });
        }

        res.json({
            expenses: rows,
            currentPage: page,
            totalPages,
            totalExpenses: count
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error fetching expenses" });
    }
};
//delete expense
exports.deleteExpense=async(req,res)=>{
    const id=req.params.id;
    //
    const expense=await Expense.findOne({
        where:{id,UserId:req.user.id}
    })
if(!expense){
    return res.status(404).json({message:'Expense not found'})
}
const amount = expense.amount;

    await expense.destroy();
    //update total

    const user=await User.findByPk(req.user.id);
    user.totalAmount -= Number(amount);
    await user.save();

    res.json({message: 'Deleted', total: user.totalAmount});
}