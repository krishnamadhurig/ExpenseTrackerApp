const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

function generateToken(id){
    return jwt.sign({id}, 'secretkey')
}
//signup
exports.signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashed = await bcrypt.hash(password, 10);

        // Create new user
        await User.create({
            name,
            email,
            password: hashed
        });

        return res.status(201).json({ message: 'Signup Success' });
    } catch (err) {
        console.error('Signup Error:', err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
//login
exports.login=async(req,res)=>{
   try{
     const {email,password}=req.body;
    const user=await User.findOne({where:{email}})
    if(!user){
        return res.status(404).json({message:'User not found'});
    }
        const match=await bcrypt.compare(password,user.password);
        if(!match) {
            return res.status(401).json({message:'Wrong Password'})
        };
        res.json({
            token:generateToken(user.id)
        })
   }catch(err){
    console.log(err)
    return res.status(500).json({message:'err.message'})
   }
       
      };
