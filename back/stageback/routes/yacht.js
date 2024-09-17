const express = require("express");
const YachtController=require("../Controllers/yachtscontroller");


const router = express.Router(); 


router.get('/getallyachts',YachtController.getyachts);


module.exports=router