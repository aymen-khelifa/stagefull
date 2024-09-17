"use strict";

var express = require("express");

var cors = require("cors");

var jwt = require("jsonwebtoken");

var bcrypt = require("bcrypt"); //const EmailSender =require ('../nodemailer');


var nodemailer = require("nodemailer");

var Site = require("../models/sites");

var multer = require("multer");

var upload = multer({
  dest: "uploads/"
});

var path = require("path");

var fs = require("fs");

var SitesController = {
  getallsites: function getallsites(req, res) {
    var response;
    return regeneratorRuntime.async(function getallsites$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return regeneratorRuntime.awrap(Site.findAll({
              attributes: ['uuid', 'productUrl', 'name', 'restricted', 'scrape']
              /* include:[{
                 model: User,
                 attributes:['name','email','url1','image','status']
              }],
              where: {
               status :"publié",accept:"accepté",'$User.status$':"activé"
              }*/

            }));

          case 3:
            response = _context.sent;
            res.json(response);
            _context.next = 10;
            break;

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);
            res.json({
              msg: _context.t0.message
            });

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, null, null, [[0, 7]]);
  },
  updatesite: function updatesite(req, res) {
    var uuid, user, _req$body, titre, description, technicalDetails, price, userReviews, imageUrl, productUrl, country, bloc, jsonData;

    return regeneratorRuntime.async(function updatesite$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            uuid = req.params.uuid;
            console.log("aa");
            console.log(uuid);
            _context2.next = 5;
            return regeneratorRuntime.awrap(Site.findOne({
              where: {
                uuid: uuid
              }
            }));

          case 5:
            user = _context2.sent;

            if (user) {
              _context2.next = 8;
              break;
            }

            return _context2.abrupt("return", res.json({
              msg: "utilisateur non trouvé"
            }));

          case 8:
            _req$body = req.body, titre = _req$body.titre, description = _req$body.description, technicalDetails = _req$body.technicalDetails, price = _req$body.price, userReviews = _req$body.userReviews, imageUrl = _req$body.imageUrl, productUrl = _req$body.productUrl, country = _req$body.country, bloc = _req$body.bloc;
            _context2.prev = 9;
            jsonData = JSON.stringify({
              titre: titre,
              description: description,
              technicalDetails: technicalDetails,
              price: price,
              userReviews: userReviews,
              imageUrl: imageUrl,
              productUrl: productUrl,
              country: country,
              bloc: bloc
            }); // Mettre à jour l'attribut JSON dans la base de données

            _context2.next = 13;
            return regeneratorRuntime.awrap(Site.update({
              scrape: jsonData
            }, {
              where: {
                uuid: uuid
              }
            }));

          case 13:
            res.json({
              msg: "profile modifié"
            });
            _context2.next = 19;
            break;

          case 16:
            _context2.prev = 16;
            _context2.t0 = _context2["catch"](9);
            res.json({
              msg: _context2.t0.message
            });

          case 19:
          case "end":
            return _context2.stop();
        }
      }
    }, null, null, [[9, 16]]);
  },
  getjsonallsites: function getjsonallsites(req, res) {
    var response;
    return regeneratorRuntime.async(function getjsonallsites$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return regeneratorRuntime.awrap(Site.findAll({
              attributes: ['uuid', 'scrape']
            }));

          case 3:
            response = _context3.sent;
            res.json(response);
            _context3.next = 10;
            break;

          case 7:
            _context3.prev = 7;
            _context3.t0 = _context3["catch"](0);
            res.json({
              msg: _context3.t0.message
            });

          case 10:
          case "end":
            return _context3.stop();
        }
      }
    }, null, null, [[0, 7]]);
  },
  updatestatussite: function updatestatussite(req, res) {
    var uuid, user;
    return regeneratorRuntime.async(function updatestatussite$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            uuid = req.params.uuid;
            console.log("aa");
            console.log(uuid);
            _context4.next = 5;
            return regeneratorRuntime.awrap(Site.findOne({
              where: {
                uuid: uuid
              }
            }));

          case 5:
            user = _context4.sent;

            if (user) {
              _context4.next = 8;
              break;
            }

            return _context4.abrupt("return", res.json({
              msg: "utilisateur non trouvé"
            }));

          case 8:
            _context4.prev = 8;
            _context4.next = 11;
            return regeneratorRuntime.awrap(Site.update({
              restricted: true
            }, {
              where: {
                uuid: uuid
              }
            }));

          case 11:
            res.json({
              msg: "status modifié"
            });
            _context4.next = 17;
            break;

          case 14:
            _context4.prev = 14;
            _context4.t0 = _context4["catch"](8);
            res.json({
              msg: _context4.t0.message
            });

          case 17:
          case "end":
            return _context4.stop();
        }
      }
    }, null, null, [[8, 14]]);
  }
};
module.exports = SitesController;