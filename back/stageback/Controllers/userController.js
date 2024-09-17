const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
//const EmailSender =require ('../nodemailer');
const nodemailer = require("nodemailer");
const User = require("../models/User");
var multer = require("multer");
var upload = multer({ dest: "uploads/" });
 const path = require("path");
const fs=require("fs");
const userController = {
  register: async (req, res) => {console.log("aa")
    const characters =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomCode = "";
    for (let i = 0; i < 25; i++) {
      randomCode += characters[Math.floor(Math.random() * characters.length)];
    }
    const today = new Date();
    const userData = {
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      activationCode: randomCode,
      created: today,
    };
    User.findOne({
      where: {
        email: req.body.email,
      },
    })
      //TODO bcrypt
      .then((user) => {
        if (!user) {
          bcrypt.hash(req.body.password, 10,async (err, hash) => {
            userData.password = hash;console.log(userData);
              await User.upsert(userData)
               {

                res.json({ message: "Votre compte est crée avec succées" });
              {/*  var transport = nodemailer.createTransport({
                  /*host: 'smtp.gmail.com',
                 port: 465,
                secure: true,
                  service: "Gmail",
                  auth: {
                    user: "gytgutu@gmail.com",
                    pass: "qfpxgkaetihdmxzl",
                  },
                });
                var mailOptions = {
                  from: "UVCT-Training",
                  to: req.body.email,
                  subject: "activer votre compte",
                  html: `
                 <div>
                  <h1>Email d'activation du compte </h1>
                    <h2>Bonjour </h2>
                  <p>Veuillez confirmer votre email en cliquant sur le lien suivant
                  <a href=http://localhost:3000/activationpage/${userData.activationCode}>Cliquez ici</a>                              
                   </div>`,
                };*/}
               {/*} transport.sendMail(mailOptions, function (error, info) {
                  if (error) {
                    console.log(error);
                  } else {
                    console.log("Mail sent successfully:-", info.response);
                  }
                });*/}
              }
              
          });
        } if(user) {console.log('ee')
          res.json({ message: "User already exist" });
        }
      })
      .catch((err) => {console.log('zz')
        res.json("error: " + err);
      });
  },
  login: async (req, res) => {
    const {  password } = req.body;
   
    try {
      const user = await User.findOne({
          where:{
              email: req.body.email,
          },
      });
      if(!user) {return res.json({message: "utlisateur non trouvé"});}
      const match = await bcrypt.compareSync(password, user.password);
      if(!match) {return res.json({message: "mot de passe incorrect"});}console.log('name')
      if(user && user.role==="instructeur" && user.accept==='en attente')
       {return res.json({message: "compte non accepté"});}console.log("a")
      if (user && user.isVerified === true) {
        
     
      //const userId = user.dataValues.uuid;console.log(userId)
      const name = user.name;console.log(name)
      const email = user.email;console.log(email)
      const uuid = user.UUid;console.log(uuid)
      const role = user.role;console.log(uuid)
      const accessToken = jwt.sign({uuid, name, email,role}, process.env.ACCESS_TOKEN_SECRET,{
          expiresIn: '5d'
      });
      console.log("5d:",accessToken)
  
    
      return res.json({message: "login avec success",accessToken,user })
    } else {
      res.json({ message: "verifiez votre compte" });
      console.log("bbb");
    }
  } catch (error) {
      res.json({message:"Utilisateur non trouvé ou une probléme trouvé"});
  }
  },
  getUser: async (req, res) => {
   const code=req.params.id;console.log(code);
    try {
      const response = await User.findOne({
        attributes: ["uuid", "name", "email", "role", "tel","url1" ,"image" ,"genre"],
         where: {
          uuid : code,
      }
      });
      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
  deleteUser: async (req, res) => {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (!user) return res.status(404).json({ msg: "User not found" });
    try {
      await User.destroy({
        where: {
          uuid: user.uuid,
        },
      });
      res.status(200).json({ msg: "User Deleted" });
    } catch (error) {
      res.status(400).json({ msg: error.message });
    }
  },
  forgetpass: async (req, res) => {
    User.findOne({
      where: {
        email: req.body.email,
      },
    })
      .then((user) => {console.log(user)
        var transport = nodemailer.createTransport({
          service: "Gmail",
          auth: {
            user: "gytgutu@gmail.com",
            pass: "qfpxgkaetihdmxzl",
          },
        });

        var mailOptions = {
          from: "UVCT-Training",
          to: req.body.email,
          subject: "password oublie??",
          html: `
             <div>
              <h1>Email de verification  </h1>
                <h2>Bonjour </h2>
              <p>Veuillez confirmer votre email en cliquant sur le lien suivant
              <a href=http://localhost:3000/ResetPassword/${user.activationCode}>Cliquez ici</a>                              
               </div>`,
        };
        res
              .json({ message: "Mail sent successfully check your inbox" });
        transport.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            res.json("error: ");
          } else {
            console.log("Mail sent successfully:-", info.response);
           
          }
        });
      })
      .catch((err) => {
        res.json({ message: "user non trouve" });
      });
  },
  resetpass: async (req, res) => {
    const { password, confpassword, email } = req.body;
    let hashPassword;
    hashPassword = await bcrypt.hash(password, 10);
    const code=req.params.activationCode;console.log(code)
    if (password !== confpassword)
      return res
        .json({ message: "Password and Confirmation Password does not match" });
    try {
      User.update(
        { password: hashPassword },
        {
          where: {
            activationCode : code,
          },
        }
      );console.log("aa")
       res.json({ message: "mot de passe modifié" });
    } catch (error) {
       res.json({ message: "erreur" });
    }
  },
  Userinfo: async (req, res) => {
    if (!req.session.userId) {
      return res
        .status(401)
        .json({ msg: "Veuillez vous connecter à votre compte !" });
    }

    const user = await User.findOne({
      attributes: ["UUid", "name", "email", "role"],
      where: {
        UUid: req.session.userId,
      },
    });
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });
    res.status(200).json(user);
  },
  updateUser: async (req, res) => {
    const user = await User.findOne({
      where: {
        email: req.body.email,
      },
    });
    if (!user) return res.json({ msg: "utilisateur non trouvé" });
    const { name, email, tel } = req.body;

    try {
      await User.update(
        {
          name: name,
          email: email,
          tel: tel,
        },
        {
          where: {
            email: user.email,
          },
        }
      );
      res.json({ msg: "profile modifié" });
    } catch (error) {
      res.json({ msg: error.message });
    }
  },
  changerpass: async (req, res) => {
    const code=req.params.id
    console.log('aa')
    const user = await User.findOne({
      where: {
        uuid:code,
      },
    });
    console.log('aa')
    //if (!user) {return res.json({ message: "utilisateur non trouvé" });}
    const { password } = req.body;console.log(password)
 
    let hashPassword;
    hashPassword = await bcrypt.hash(password, 10);

    try {
      await User.update({
        password: hashPassword,
      },{ where: {
        uuid:code,
     }} );
      return res.json({ message: "mot de passe modifié" });
    } catch (error) {
      return res.json({ message: "modification echouée"});
    }
  },
  Logout : async(req, res) => {
  
    res.clearCookie('refreshToken');
    return res.sendStatus(200);
},
updateimage:async(req,res)=>{
  const uuid=req.params.id
 
  if(req.files === null) return res.status(400).json({msg: "No File Uploaded"}); 
  const file = req.files.file;
  const ext = path.extname(file.name);
  const fileName = file.md5 + ext;
  const url = `${req.protocol}://${req.get("host")}/images/${fileName}`;
  const allowedType = ['.png','.jpg','.jpeg'];

  if(!allowedType.includes(ext.toLowerCase())) return res.status(422).json({msg: "Invalid Images"});


  file.mv(`./public/images/${fileName}`, async(err)=>{
      if(err) return res.status(500).json({msg: err.message});
      try {
            await User.update({
              image: fileName, url1: url
              
          },{
              where:{
                uuid: uuid
              }
          });
        
          res.status(201).json({msg: "image bien ajouté "});
      } catch (error) {
          console.log(error.message);
      }
  })
},



};
module.exports = userController;
