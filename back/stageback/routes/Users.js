const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Sequelize =require('sequelize')

const userController=require("../Controllers/userController")
const User = require("../models/User");

router.patch("/ajouterimage/:id",userController.updateimage);

router.post("/register", userController.register );
router.post("/login", userController.login);
router.get("/profile", (req, res) => {
  var decoded = jwt.verify(
    req.headers["authorization"],
    process.env.SECRET_KEY
  );

  User.findOne({
    where: {
      id: decoded.id,
    },
  })
    .then((user) => {
      if (user) {
        res.json(user);
      } else {
        res.send("User does not exist");
      }
    })
    .catch((err) => {
      res.send("error: " + err);
    });
});
router.post('/getmail',userController.forgetpass);//,verifyUser
router.patch("/update/:activationCode",userController.resetpass);//verifyUser,
router.get("/activationpage/:activationCode", function(req, res) {
  const code=req.params.activationCode;console.log(code)
  Apprenant.findOne({
   where: {
    activationCode : code

  } 
    
  }).then((user)=>{console.log(user)
    if (!user ) {console.log('aaa');
    return res.send({
      message: "le code d'activation semble étre faux !",
    });
   }  if (user && user.isVerified === true) {console.log('bbb');
        return res.send({
          message: "Votre compte est déja activé !",
        });
      }  if (user && user.isVerified === false){Apprenant.update({ isVerified: true,role:'apprenant' }, {
        where: {
          isVerified: false,
          role:'apprenant'

        }
      });console.log('ccc');
          return res.send({
            message: " Votre compte est activé avec succées !",
          
        });
      }else {return res.send({
        message: " verification echouée",
      
    });}
    })
   
;});
router.get("/getuser/:id",userController.getUser);//,admin,,,,verifyTokenSA,verifyTokenfor ,checkUserRole,
router.get("/userinfo",userController.Userinfo);
router.patch("/changpass/:id",userController.changerpass);
router.patch("/updateinfo",userController.updateUser);
router.delete('/supprimer',userController.deleteUser);

router.patch("/Logout",userController.Logout);


module.exports = router;
