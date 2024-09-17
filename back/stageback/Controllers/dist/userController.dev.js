"use strict";

var express = require("express");

var cors = require("cors");

var jwt = require("jsonwebtoken");

var bcrypt = require("bcrypt"); //const EmailSender =require ('../nodemailer');


var nodemailer = require("nodemailer");

var User = require("../models/User");

var multer = require("multer");

var upload = multer({
  dest: "uploads/"
});

var path = require("path");

var fs = require("fs");

var userController = {
  register: function register(req, res) {
    var characters, randomCode, i, today, userData;
    return regeneratorRuntime.async(function register$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            console.log("aa");
            characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
            randomCode = "";

            for (i = 0; i < 25; i++) {
              randomCode += characters[Math.floor(Math.random() * characters.length)];
            }

            today = new Date();
            userData = {
              name: req.body.name,
              email: req.body.email,
              password: req.body.password,
              activationCode: randomCode,
              created: today
            };
            User.findOne({
              where: {
                email: req.body.email
              }
            }) //TODO bcrypt
            .then(function (user) {
              if (!user) {
                bcrypt.hash(req.body.password, 10, function _callee(err, hash) {
                  return regeneratorRuntime.async(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          userData.password = hash;
                          console.log(userData);
                          _context.next = 4;
                          return regeneratorRuntime.awrap(User.upsert(userData));

                        case 4:
                          res.json({
                            message: "Votre compte est crée avec succées"
                          });

                        case 5:
                        case "end":
                          return _context.stop();
                      }
                    }
                  });
                });
              }

              if (user) {
                console.log('ee');
                res.json({
                  message: "User already exist"
                });
              }
            })["catch"](function (err) {
              console.log('zz');
              res.json("error: " + err);
            });

          case 7:
          case "end":
            return _context2.stop();
        }
      }
    });
  },
  login: function login(req, res) {
    var password, user, match, name, email, uuid, role, accessToken;
    return regeneratorRuntime.async(function login$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            password = req.body.password;
            _context3.prev = 1;
            _context3.next = 4;
            return regeneratorRuntime.awrap(User.findOne({
              where: {
                email: req.body.email
              }
            }));

          case 4:
            user = _context3.sent;

            if (user) {
              _context3.next = 7;
              break;
            }

            return _context3.abrupt("return", res.json({
              message: "utlisateur non trouvé"
            }));

          case 7:
            _context3.next = 9;
            return regeneratorRuntime.awrap(bcrypt.compareSync(password, user.password));

          case 9:
            match = _context3.sent;

            if (match) {
              _context3.next = 12;
              break;
            }

            return _context3.abrupt("return", res.json({
              message: "mot de passe incorrect"
            }));

          case 12:
            console.log('name');

            if (!(user && user.role === "instructeur" && user.accept === 'en attente')) {
              _context3.next = 15;
              break;
            }

            return _context3.abrupt("return", res.json({
              message: "compte non accepté"
            }));

          case 15:
            console.log("a");

            if (!(user && user.isVerified === true)) {
              _context3.next = 30;
              break;
            }

            //const userId = user.dataValues.uuid;console.log(userId)
            name = user.name;
            console.log(name);
            email = user.email;
            console.log(email);
            uuid = user.UUid;
            console.log(uuid);
            role = user.role;
            console.log(uuid);
            accessToken = jwt.sign({
              uuid: uuid,
              name: name,
              email: email,
              role: role
            }, process.env.ACCESS_TOKEN_SECRET, {
              expiresIn: '5d'
            });
            console.log("5d:", accessToken);
            return _context3.abrupt("return", res.json({
              message: "login avec success",
              accessToken: accessToken,
              user: user
            }));

          case 30:
            res.json({
              message: "verifiez votre compte"
            });
            console.log("bbb");

          case 32:
            _context3.next = 37;
            break;

          case 34:
            _context3.prev = 34;
            _context3.t0 = _context3["catch"](1);
            res.json({
              message: "Utilisateur non trouvé ou une probléme trouvé"
            });

          case 37:
          case "end":
            return _context3.stop();
        }
      }
    }, null, null, [[1, 34]]);
  },
  getUser: function getUser(req, res) {
    var code, response;
    return regeneratorRuntime.async(function getUser$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            code = req.params.id;
            console.log(code);
            _context4.prev = 2;
            _context4.next = 5;
            return regeneratorRuntime.awrap(User.findOne({
              attributes: ["uuid", "name", "email", "role", "tel", "url1", "image", "genre"],
              where: {
                uuid: code
              }
            }));

          case 5:
            response = _context4.sent;
            res.status(200).json(response);
            _context4.next = 12;
            break;

          case 9:
            _context4.prev = 9;
            _context4.t0 = _context4["catch"](2);
            res.status(500).json({
              msg: _context4.t0.message
            });

          case 12:
          case "end":
            return _context4.stop();
        }
      }
    }, null, null, [[2, 9]]);
  },
  deleteUser: function deleteUser(req, res) {
    var user;
    return regeneratorRuntime.async(function deleteUser$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return regeneratorRuntime.awrap(User.findOne({
              where: {
                email: req.body.email
              }
            }));

          case 2:
            user = _context5.sent;

            if (user) {
              _context5.next = 5;
              break;
            }

            return _context5.abrupt("return", res.status(404).json({
              msg: "User not found"
            }));

          case 5:
            _context5.prev = 5;
            _context5.next = 8;
            return regeneratorRuntime.awrap(User.destroy({
              where: {
                uuid: user.uuid
              }
            }));

          case 8:
            res.status(200).json({
              msg: "User Deleted"
            });
            _context5.next = 14;
            break;

          case 11:
            _context5.prev = 11;
            _context5.t0 = _context5["catch"](5);
            res.status(400).json({
              msg: _context5.t0.message
            });

          case 14:
          case "end":
            return _context5.stop();
        }
      }
    }, null, null, [[5, 11]]);
  },
  forgetpass: function forgetpass(req, res) {
    return regeneratorRuntime.async(function forgetpass$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            User.findOne({
              where: {
                email: req.body.email
              }
            }).then(function (user) {
              console.log(user);
              var transport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                  user: "gytgutu@gmail.com",
                  pass: "qfpxgkaetihdmxzl"
                }
              });
              var mailOptions = {
                from: "UVCT-Training",
                to: req.body.email,
                subject: "password oublie??",
                html: "\n             <div>\n              <h1>Email de verification  </h1>\n                <h2>Bonjour </h2>\n              <p>Veuillez confirmer votre email en cliquant sur le lien suivant\n              <a href=http://localhost:3000/ResetPassword/".concat(user.activationCode, ">Cliquez ici</a>                              \n               </div>")
              };
              res.json({
                message: "Mail sent successfully check your inbox"
              });
              transport.sendMail(mailOptions, function (error, info) {
                if (error) {
                  console.log(error);
                  res.json("error: ");
                } else {
                  console.log("Mail sent successfully:-", info.response);
                }
              });
            })["catch"](function (err) {
              res.json({
                message: "user non trouve"
              });
            });

          case 1:
          case "end":
            return _context6.stop();
        }
      }
    });
  },
  resetpass: function resetpass(req, res) {
    var _req$body, password, confpassword, email, hashPassword, code;

    return regeneratorRuntime.async(function resetpass$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            _req$body = req.body, password = _req$body.password, confpassword = _req$body.confpassword, email = _req$body.email;
            _context7.next = 3;
            return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

          case 3:
            hashPassword = _context7.sent;
            code = req.params.activationCode;
            console.log(code);

            if (!(password !== confpassword)) {
              _context7.next = 8;
              break;
            }

            return _context7.abrupt("return", res.json({
              message: "Password and Confirmation Password does not match"
            }));

          case 8:
            try {
              User.update({
                password: hashPassword
              }, {
                where: {
                  activationCode: code
                }
              });
              console.log("aa");
              res.json({
                message: "mot de passe modifié"
              });
            } catch (error) {
              res.json({
                message: "erreur"
              });
            }

          case 9:
          case "end":
            return _context7.stop();
        }
      }
    });
  },
  Userinfo: function Userinfo(req, res) {
    var user;
    return regeneratorRuntime.async(function Userinfo$(_context8) {
      while (1) {
        switch (_context8.prev = _context8.next) {
          case 0:
            if (req.session.userId) {
              _context8.next = 2;
              break;
            }

            return _context8.abrupt("return", res.status(401).json({
              msg: "Veuillez vous connecter à votre compte !"
            }));

          case 2:
            _context8.next = 4;
            return regeneratorRuntime.awrap(User.findOne({
              attributes: ["UUid", "name", "email", "role"],
              where: {
                UUid: req.session.userId
              }
            }));

          case 4:
            user = _context8.sent;

            if (user) {
              _context8.next = 7;
              break;
            }

            return _context8.abrupt("return", res.status(404).json({
              msg: "Utilisateur non trouvé"
            }));

          case 7:
            res.status(200).json(user);

          case 8:
          case "end":
            return _context8.stop();
        }
      }
    });
  },
  updateUser: function updateUser(req, res) {
    var user, _req$body2, name, email, tel;

    return regeneratorRuntime.async(function updateUser$(_context9) {
      while (1) {
        switch (_context9.prev = _context9.next) {
          case 0:
            _context9.next = 2;
            return regeneratorRuntime.awrap(User.findOne({
              where: {
                email: req.body.email
              }
            }));

          case 2:
            user = _context9.sent;

            if (user) {
              _context9.next = 5;
              break;
            }

            return _context9.abrupt("return", res.json({
              msg: "utilisateur non trouvé"
            }));

          case 5:
            _req$body2 = req.body, name = _req$body2.name, email = _req$body2.email, tel = _req$body2.tel;
            _context9.prev = 6;
            _context9.next = 9;
            return regeneratorRuntime.awrap(User.update({
              name: name,
              email: email,
              tel: tel
            }, {
              where: {
                email: user.email
              }
            }));

          case 9:
            res.json({
              msg: "profile modifié"
            });
            _context9.next = 15;
            break;

          case 12:
            _context9.prev = 12;
            _context9.t0 = _context9["catch"](6);
            res.json({
              msg: _context9.t0.message
            });

          case 15:
          case "end":
            return _context9.stop();
        }
      }
    }, null, null, [[6, 12]]);
  },
  changerpass: function changerpass(req, res) {
    var code, user, password, hashPassword;
    return regeneratorRuntime.async(function changerpass$(_context10) {
      while (1) {
        switch (_context10.prev = _context10.next) {
          case 0:
            code = req.params.id;
            console.log('aa');
            _context10.next = 4;
            return regeneratorRuntime.awrap(User.findOne({
              where: {
                uuid: code
              }
            }));

          case 4:
            user = _context10.sent;
            console.log('aa'); //if (!user) {return res.json({ message: "utilisateur non trouvé" });}

            password = req.body.password;
            console.log(password);
            _context10.next = 10;
            return regeneratorRuntime.awrap(bcrypt.hash(password, 10));

          case 10:
            hashPassword = _context10.sent;
            _context10.prev = 11;
            _context10.next = 14;
            return regeneratorRuntime.awrap(User.update({
              password: hashPassword
            }, {
              where: {
                uuid: code
              }
            }));

          case 14:
            return _context10.abrupt("return", res.json({
              message: "mot de passe modifié"
            }));

          case 17:
            _context10.prev = 17;
            _context10.t0 = _context10["catch"](11);
            return _context10.abrupt("return", res.json({
              message: "modification echouée"
            }));

          case 20:
          case "end":
            return _context10.stop();
        }
      }
    }, null, null, [[11, 17]]);
  },
  Logout: function Logout(req, res) {
    return regeneratorRuntime.async(function Logout$(_context11) {
      while (1) {
        switch (_context11.prev = _context11.next) {
          case 0:
            res.clearCookie('refreshToken');
            return _context11.abrupt("return", res.sendStatus(200));

          case 2:
          case "end":
            return _context11.stop();
        }
      }
    });
  },
  updateimage: function updateimage(req, res) {
    var uuid, file, ext, fileName, url, allowedType;
    return regeneratorRuntime.async(function updateimage$(_context13) {
      while (1) {
        switch (_context13.prev = _context13.next) {
          case 0:
            uuid = req.params.id;

            if (!(req.files === null)) {
              _context13.next = 3;
              break;
            }

            return _context13.abrupt("return", res.status(400).json({
              msg: "No File Uploaded"
            }));

          case 3:
            file = req.files.file;
            ext = path.extname(file.name);
            fileName = file.md5 + ext;
            url = "".concat(req.protocol, "://").concat(req.get("host"), "/images/").concat(fileName);
            allowedType = ['.png', '.jpg', '.jpeg'];

            if (allowedType.includes(ext.toLowerCase())) {
              _context13.next = 10;
              break;
            }

            return _context13.abrupt("return", res.status(422).json({
              msg: "Invalid Images"
            }));

          case 10:
            file.mv("./public/images/".concat(fileName), function _callee2(err) {
              return regeneratorRuntime.async(function _callee2$(_context12) {
                while (1) {
                  switch (_context12.prev = _context12.next) {
                    case 0:
                      if (!err) {
                        _context12.next = 2;
                        break;
                      }

                      return _context12.abrupt("return", res.status(500).json({
                        msg: err.message
                      }));

                    case 2:
                      _context12.prev = 2;
                      _context12.next = 5;
                      return regeneratorRuntime.awrap(User.update({
                        image: fileName,
                        url1: url
                      }, {
                        where: {
                          uuid: uuid
                        }
                      }));

                    case 5:
                      res.status(201).json({
                        msg: "image bien ajouté "
                      });
                      _context12.next = 11;
                      break;

                    case 8:
                      _context12.prev = 8;
                      _context12.t0 = _context12["catch"](2);
                      console.log(_context12.t0.message);

                    case 11:
                    case "end":
                      return _context12.stop();
                  }
                }
              }, null, null, [[2, 8]]);
            });

          case 11:
          case "end":
            return _context13.stop();
        }
      }
    });
  }
};
module.exports = userController;