const User=require('../models/user');
exports.getLeaderboard=async(req,res)=>{
    try{
        const users=await User.findAll({
            order:[['totalAmount','DESC']],
            attributes:['name','totalAmount', 'isPremium'],
            limit:10,
            
        })
    
    res.json({leaderboard:users})
    }catch(err){
        console.log(err);
        res.status(500).json({message:'Server error'})
    }
}