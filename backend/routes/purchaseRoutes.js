const express=require('express');
const router=express.Router();
const controllers=require('../controllers/purchaseController');
console.log(controllers)
const {authenticate}=require('../middleware/authMiddleware');

router.get('/order', authenticate, controllers.createOrder);
router.post('/verify', authenticate, controllers.verifyPayment);


module.exports=router