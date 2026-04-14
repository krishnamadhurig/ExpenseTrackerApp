const express=require('express');
const router=express.Router();
const leaderboardController=require('../controllers/leaderboardController');
const {authenticate}=require('../middleware/authMiddleware')
router.get('/leaderboard',authenticate,leaderboardController.getLeaderboard);
module.exports=router