const express=require('express');
const router=express.Router();
const {authenticate}=require('../middleware/authMiddleware');
const {getExpenses,deleteExpense}=require('../controllers/expenseController')
const expenseController = require("../controllers/expenseController");

router.post("/addExpense", authenticate, expenseController.addExpense);
router.get('/getExpenses',authenticate,getExpenses);
router.delete('/deleteExpense/:id',authenticate,deleteExpense)
module.exports=router;