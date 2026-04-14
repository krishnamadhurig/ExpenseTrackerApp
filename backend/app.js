require('dotenv').config();
console.log("ENV TEST:", process.env.GEMINI_API_KEY);

console.log("SMTP_USER:", process.env.SMTP_USER);
console.log("SMTP_PASS:", process.env.SMTP_PASS);
const express=require('express');
const cors=require('cors');

const sequelize=require('./config/db')
const app=express();
app.use(cors());
app.use(express.json())

const User=require('./models/user');
const Expense=require('./models/expense')
const Order = require('./models/order');//
const ForgotPasswordRequest = require("./models/ForgotPasswordRequest");

const userRoutes=require('./routes/userRoutes')
const expenseRoutes=require('./routes/expenseRoutes')
const purchaseRoutes=require('./routes/purchaseRoutes')
const leaderboardRoutes=require('./routes/leaderboardRoutes')
const passwordRoutes = require("./routes/passwordRoutes");
const reportRoutes = require("./routes/report");



app.use('/api',userRoutes);
app.use('/api',expenseRoutes);
app.use('/api',purchaseRoutes);
app.use('/api',leaderboardRoutes)
app.use("/api", passwordRoutes);
app.use("/api", reportRoutes);

//associations
User.hasMany(Expense);
Expense.belongsTo(User)

User.hasMany(Order);//
Order.belongsTo(User);//

User.hasMany(ForgotPasswordRequest);
ForgotPasswordRequest.belongsTo(User);

sequelize.sync()
.then(()=>{
    app.listen(3000,()=>{
    console.log("server running on port 3000")
})
}).catch((err)=>{
    console.log(err)
})
