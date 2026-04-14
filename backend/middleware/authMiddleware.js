const jwt = require('jsonwebtoken');
const User=require('../models/user')

exports.authenticate=async(req,res,next)=>{
    try{
        const token=req.header('Authorization')
        console.log(token)
        const decoded=jwt.verify(token,'secretkey');
        const user=await User.findByPk(decoded.id);
        req.user=user;
        
        next();
    }catch(err){
        res.status(401).json({error:'Invalid token'});
        
    }
}