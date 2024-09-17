"use strict";

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var express = require('express');

var cors = require('cors');

var bodyParser = require('body-parser');

var mysql = require("mysql");

var port = process.env.PORT || 5000;

var SequelizeStore = require("connect-session-sequelize");

var session = require("express-session");

var flash = require("express-flash");

var app = express();

var natural = require('natural');

var tokenizer = new natural.WordTokenizer();

var axios = require('axios');

var dotenv = require("dotenv").config(); //fileUpload = require("express-fileupload"),


var User = require("./models/User");

var yacht = require("./models/yachts");

var request = require('request-promise');

var Sequelize = require('sequelize');

var multer = require('multer');

var path = require('path');

var cron = require('node-cron');

var puppeteer = require('puppeteer');

var cheerio = require('cheerio');

var storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, 'images');
  },
  filename: function filename(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
var upload = multer({
  storage: storage
});
app.use(session({
  secret: '123458cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 60000
  },
  secure: 'auto'
}));

var _require = require('child_process'),
    exec = _require.exec;

var ps = require('ps-node'); // enregistrer des message de la session 


app.set("view engine", "ejs");
app.use(flash());
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:3000',
  "preflightContinue": true,
  "optionsSuccessStatus": 200,
  credentials: true
}));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', "http://localhost:3000");
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,X-Requested-With,content-type,Access-control-request-methods,access-control-allow-origin');
  res.header("X-Requested-With", "XMLHttpRequest");
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});
app.options("http://localhost:3000", cors());

var FileUpload = require("express-fileupload");

app.use(FileUpload());
app.use(express.urlencoded({
  extended: true
}));
app.use('/images', express["static"]('public/images')); //requte f postman

function getCountryFromUrl(url) {
  var domain = url.split('/')[2];
  var countryTLDs = {
    'fr': 'France',
    'de': 'Germany',
    'it': 'Italy',
    'es': 'Spain',
    'co.uk': 'United Kingdom',
    'com': 'International'
  };

  for (var _i = 0, _Object$entries = Object.entries(countryTLDs); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
        tld = _Object$entries$_i[0],
        _country = _Object$entries$_i[1];

    if (domain.endsWith(tld)) {
      return _country;
    }
  }

  return 'Unknown';
}

function scrapeGoogle() {
  var browser, page, searchQuery, url, content, $, results;
  return regeneratorRuntime.async(function scrapeGoogle$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(puppeteer.launch({
            headless: true
          }));

        case 2:
          browser = _context.sent;
          _context.next = 5;
          return regeneratorRuntime.awrap(browser.newPage());

        case 5:
          page = _context.sent;
          searchQuery = 'voiliers de yacht à vendre';
          url = "https://www.google.com/search?q=".concat(encodeURIComponent(searchQuery));
          _context.next = 10;
          return regeneratorRuntime.awrap(page["goto"](url, {
            waitUntil: 'networkidle2'
          }));

        case 10:
          _context.next = 12;
          return regeneratorRuntime.awrap(page.content());

        case 12:
          content = _context.sent;
          $ = cheerio.load(content);
          results = [];
          $('div.g').each(function (i, element) {
            var name = $(element).find('h3').text();
            var description = $(element).find('.IsZvec').text();
            var link = $(element).find('a').attr('href');
            var imageUrl = $(element).find('img').attr('src');
            var price = $(element).find('.price').text().trim() || $(element).find('.a-price-whole').text().trim() || $(element).find('.a-price').text().trim() || $(element).find('.listingPrice').text().trim() || $(element).find('.blurb__price').text() //'Non spécifié'
            ;
            var userReviews = $(element).find('.reviews').text() || 'Non spécifié';
            var technicalDetails = $(element).find('.technical-details').text() || 'Non spécifié';
            var country = getCountryFromUrl(link);

            if (name && link) {
              results.push({
                name: name,
                description: description,
                technicalDetails: technicalDetails,
                price: price,
                userReviews: userReviews,
                imageUrl: imageUrl,
                productUrl: link,
                country: country
              });
            }
          });
          _context.next = 18;
          return regeneratorRuntime.awrap(browser.close());

        case 18:
          return _context.abrupt("return", results);

        case 19:
        case "end":
          return _context.stop();
      }
    }
  });
} // Mise à jour de la base de données


function updateDatabase() {
  var results, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, result, name, description, technicalDetails, price, userReviews, imageUrl, productUrl, _country2;

  return regeneratorRuntime.async(function updateDatabase$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(scrapeGoogle());

        case 2:
          results = _context2.sent;
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context2.prev = 6;
          _iterator = results[Symbol.iterator]();

        case 8:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context2.next = 16;
            break;
          }

          result = _step.value;
          name = result.name, description = result.description, technicalDetails = result.technicalDetails, price = result.price, userReviews = result.userReviews, imageUrl = result.imageUrl, productUrl = result.productUrl, _country2 = result.country;
          _context2.next = 13;
          return regeneratorRuntime.awrap(User.upsert({
            name: name,
            description: description,
            technicalDetails: technicalDetails,
            price: price,
            userReviews: userReviews,
            imageUrl: imageUrl,
            productUrl: productUrl,
            country: _country2
          }, {
            where: {
              productUrl: productUrl
            }
          }));

        case 13:
          _iteratorNormalCompletion = true;
          _context2.next = 8;
          break;

        case 16:
          _context2.next = 22;
          break;

        case 18:
          _context2.prev = 18;
          _context2.t0 = _context2["catch"](6);
          _didIteratorError = true;
          _iteratorError = _context2.t0;

        case 22:
          _context2.prev = 22;
          _context2.prev = 23;

          if (!_iteratorNormalCompletion && _iterator["return"] != null) {
            _iterator["return"]();
          }

        case 25:
          _context2.prev = 25;

          if (!_didIteratorError) {
            _context2.next = 28;
            break;
          }

          throw _iteratorError;

        case 28:
          return _context2.finish(25);

        case 29:
          return _context2.finish(22);

        case 30:
          console.log('Données mises à jour dans la base de données');

        case 31:
        case "end":
          return _context2.stop();
      }
    }
  }, null, null, [[6, 18, 22, 30], [23,, 25, 29]]);
} // Configuration de la tâche cron pour exécuter le script tous les jours à 8h du matin


cron.schedule('0 8 * * *', function () {
  console.log('Tâche cron démarrée');
  updateDatabase1();
});

function fetchAllProductUrls() {
  var yachtSales, productUrls;
  return regeneratorRuntime.async(function fetchAllProductUrls$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(User.findAll({
            attributes: ['productUrl']
          }));

        case 2:
          yachtSales = _context3.sent;

          if (!Array.isArray(yachtSales)) {
            _context3.next = 6;
            break;
          }

          productUrls = yachtSales.map(function (yachtSale) {
            return yachtSale.productUrl;
          }); // console.log('Extracted product URLs:', productUrls);

          return _context3.abrupt("return", productUrls);

        case 6:
        case "end":
          return _context3.stop();
      }
    }
  });
}

var sleep = function sleep(milliseconds) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, milliseconds);
  });
};

var productUrls1 = fetchAllProductUrls(); //https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale

function scrapeYachtWorld1() {
  return regeneratorRuntime.async(function scrapeYachtWorld1$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          // let item1="https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale";
          l = ["https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale", "https://www.ayc.fr/voilier-occasion"];
          l.forEach(function _callee2(item1, index) {
            var browser, page, captchaSolution, content, $, listings, boats, delay, yachtList, upsertResults, _upsertResults, _upsertResults2;

            return regeneratorRuntime.async(function _callee2$(_context8) {
              while (1) {
                switch (_context8.prev = _context8.next) {
                  case 0:
                    _context8.next = 2;
                    return regeneratorRuntime.awrap(puppeteer.launch({
                      headless: true
                    }));

                  case 2:
                    browser = _context8.sent;
                    _context8.next = 5;
                    return regeneratorRuntime.awrap(browser.newPage());

                  case 5:
                    page = _context8.sent;
                    _context8.next = 8;
                    return regeneratorRuntime.awrap(page["goto"](item1));

                  case 8:
                    _context8.next = 10;
                    return regeneratorRuntime.awrap(page.$('img.captcha'));

                  case 10:
                    if (!_context8.sent) {
                      _context8.next = 20;
                      break;
                    }

                    _context8.next = 13;
                    return regeneratorRuntime.awrap(solveCaptcha(page));

                  case 13:
                    captchaSolution = _context8.sent;
                    _context8.next = 16;
                    return regeneratorRuntime.awrap(page.type('input[name="captcha"]', captchaSolution));

                  case 16:
                    _context8.next = 18;
                    return regeneratorRuntime.awrap(page.click('button[type="submit"]'));

                  case 18:
                    _context8.next = 20;
                    return regeneratorRuntime.awrap(page.waitForNavigation({
                      waitUntil: 'domcontentloaded'
                    }));

                  case 20:
                    _context8.next = 22;
                    return regeneratorRuntime.awrap(page.content());

                  case 22:
                    content = _context8.sent;
                    $ = cheerio.load(content);
                    listings = [];
                    boats = [];

                    delay = function delay(ms) {
                      return new Promise(function (resolve) {
                        return setTimeout(resolve, ms);
                      });
                    };

                    console.log(item1);

                    if (item1 = "https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale") {
                      yachtList = $('div.y-grid a.yp'); // Select all yacht listings

                      console.log('Scraped Data2ddd');
                      yachtList.each(function (index, element) {
                        var name = $(element).find('h2.yp__title').text().trim();
                        var priceText = $(element).find('p.yp__sum span').text().trim();
                        var priceMatch = priceText.match(/EUR\s([\d,]+)/); // Extract EUR and digits

                        var price = $(element).find('.yp__sum span').text().trim();
                        var detailsList = $(element).find('ul.yp__ms li.yp__msi');
                        var productUrl = $(element).attr('href');
                        var length = '',
                            cabins = '',
                            year = '',
                            country = '';
                        var imageUrla = $(element).find('.yp__visual img.yp__caro-img').attr('src');
                        var construction = $(element).find('.yp__ms li:nth-child(3)').text().trim();
                        detailsList.each(function (idx, el) {
                          var text = $(el).text().trim();

                          if (text.includes('Longueur')) {
                            length = text.replace('Longueur : ', '');
                          } else if (text.includes('cabine(s)')) {
                            cabins = text;
                          } else if (text.includes('Chantier')) {
                            year = text.split(',')[0].replace('Chantier ', '');
                            country = text.split(', ').pop();
                          }
                        });
                        var imageUrls = [];
                        /*$('ul.glide__slides li.glide__slide picture img').each((index, element) => {
                          const imgSrc = $(element).attr('src');
                          if (imgSrc) {
                            imageUrls.push(imgSrc);
                          }
                        });*/

                        var a = "https://www.burgessyachts.com";
                        var imageUrl = "".concat(a).concat(imageUrla);
                        var description = "".concat(length, " ").concat(cabins);
                        var technicalDetails = "".concat(length, " ").concat(cabins);
                        console.log('Yacht Name:', name);
                        console.log('Price:', price);
                        console.log('Length:', "".concat(a).concat(imageUrl));
                        console.log('Cabins:', description);
                        console.log('Year:', year);
                        console.log('---', productUrl);
                        console.log('---', country);
                        console.log('---', imageUrls);
                        var aa = "";
                        listings.push({
                          name: name,
                          description: description,
                          technicalDetails: technicalDetails,
                          price: price,
                          aa: aa,
                          year: year,
                          imageUrl: imageUrl,
                          productUrl: productUrl,
                          country: country
                        });
                        console.log(listings);
                      });

                      upsertResults = function upsertResults(listings) {
                        var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, result, name, description, technicalDetails, price, userReviews, imageUrl, productUrl, _country3;

                        return regeneratorRuntime.async(function upsertResults$(_context4) {
                          while (1) {
                            switch (_context4.prev = _context4.next) {
                              case 0:
                                _iteratorNormalCompletion2 = true;
                                _didIteratorError2 = false;
                                _iteratorError2 = undefined;
                                _context4.prev = 3;
                                _iterator2 = listings[Symbol.iterator]();

                              case 5:
                                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                                  _context4.next = 15;
                                  break;
                                }

                                result = _step2.value;
                                name = result.name, description = result.description, technicalDetails = result.technicalDetails, price = result.price, userReviews = result.userReviews, imageUrl = result.imageUrl, productUrl = result.productUrl, _country3 = result.country;
                                _context4.next = 10;
                                return regeneratorRuntime.awrap(yacht.upsert({
                                  name: name,
                                  description: description,
                                  technicalDetails: technicalDetails,
                                  price: price,
                                  userReviews: userReviews,
                                  imageUrl: imageUrl,
                                  productUrl: productUrl,
                                  country: _country3
                                }));

                              case 10:
                                _context4.next = 12;
                                return regeneratorRuntime.awrap(delay(500));

                              case 12:
                                _iteratorNormalCompletion2 = true;
                                _context4.next = 5;
                                break;

                              case 15:
                                _context4.next = 21;
                                break;

                              case 17:
                                _context4.prev = 17;
                                _context4.t0 = _context4["catch"](3);
                                _didIteratorError2 = true;
                                _iteratorError2 = _context4.t0;

                              case 21:
                                _context4.prev = 21;
                                _context4.prev = 22;

                                if (!_iteratorNormalCompletion2 && _iterator2["return"] != null) {
                                  _iterator2["return"]();
                                }

                              case 24:
                                _context4.prev = 24;

                                if (!_didIteratorError2) {
                                  _context4.next = 27;
                                  break;
                                }

                                throw _iteratorError2;

                              case 27:
                                return _context4.finish(24);

                              case 28:
                                return _context4.finish(21);

                              case 29:
                              case "end":
                                return _context4.stop();
                            }
                          }
                        }, null, null, [[3, 17, 21, 29], [22,, 24, 28]]);
                      };

                      upsertResults(listings).then(function () {
                        console.log('Upsert operations completed.');
                      });
                    } else if (item1 = "https://www.ayc.fr/voilier-occasion") {
                      console.log('Scraped Data1ddd');
                      $('.bloc-bateau').each(function _callee(index, element) {
                        var boat, delay, a;
                        return regeneratorRuntime.async(function _callee$(_context5) {
                          while (1) {
                            switch (_context5.prev = _context5.next) {
                              case 0:
                                boat = {};

                                delay = function delay(ms) {
                                  return new Promise(function (resolve) {
                                    return setTimeout(resolve, ms);
                                  });
                                };

                                a = "https://www.ayc.fr";
                                boat.imageUrl = $(element).find('.bloc-bateau-visuel a img').attr('src');
                                boat.productUrl = "https://www.ayc.fr".concat($(element).find('.bloc-bateau-visuel a').attr('href'));
                                boat.price = $(element).find('.bloc-bateau-prix a').text().trim();
                                boat.name = $(element).find('.bloc-bateau-titre a').text().trim();
                                boat.description = $(element).find('.bloc-bateau-accroche a').text().trim();
                                boat.technicalDetails = $(element).find('.bloc-bateau-accroche a').text().trim();
                                boat.country = getCountryFromUrl(item1);
                                listings.push(boat); //await delay(4000);//console.log('Scraped Data1:', listings);

                              case 11:
                              case "end":
                                return _context5.stop();
                            }
                          }
                        });
                      });

                      _upsertResults = function _upsertResults(listings) {
                        var _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, result, name, description, technicalDetails, price, userReviews, imageUrl, productUrl, _country4;

                        return regeneratorRuntime.async(function _upsertResults$(_context6) {
                          while (1) {
                            switch (_context6.prev = _context6.next) {
                              case 0:
                                _iteratorNormalCompletion3 = true;
                                _didIteratorError3 = false;
                                _iteratorError3 = undefined;
                                _context6.prev = 3;
                                _iterator3 = listings[Symbol.iterator]();

                              case 5:
                                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                  _context6.next = 15;
                                  break;
                                }

                                result = _step3.value;
                                name = result.name, description = result.description, technicalDetails = result.technicalDetails, price = result.price, userReviews = result.userReviews, imageUrl = result.imageUrl, productUrl = result.productUrl, _country4 = result.country;
                                _context6.next = 10;
                                return regeneratorRuntime.awrap(yacht.upsert({
                                  name: name,
                                  description: description,
                                  technicalDetails: technicalDetails,
                                  price: price,
                                  userReviews: userReviews,
                                  imageUrl: imageUrl,
                                  productUrl: productUrl,
                                  country: _country4
                                }));

                              case 10:
                                _context6.next = 12;
                                return regeneratorRuntime.awrap(delay(500));

                              case 12:
                                _iteratorNormalCompletion3 = true;
                                _context6.next = 5;
                                break;

                              case 15:
                                _context6.next = 21;
                                break;

                              case 17:
                                _context6.prev = 17;
                                _context6.t0 = _context6["catch"](3);
                                _didIteratorError3 = true;
                                _iteratorError3 = _context6.t0;

                              case 21:
                                _context6.prev = 21;
                                _context6.prev = 22;

                                if (!_iteratorNormalCompletion3 && _iterator3["return"] != null) {
                                  _iterator3["return"]();
                                }

                              case 24:
                                _context6.prev = 24;

                                if (!_didIteratorError3) {
                                  _context6.next = 27;
                                  break;
                                }

                                throw _iteratorError3;

                              case 27:
                                return _context6.finish(24);

                              case 28:
                                return _context6.finish(21);

                              case 29:
                              case "end":
                                return _context6.stop();
                            }
                          }
                        }, null, null, [[3, 17, 21, 29], [22,, 24, 28]]);
                      };

                      _upsertResults(listings).then(function () {
                        console.log('Upsert operations completed.');
                      });
                    } //console.log(content)
                    else if (item1 = "https://www.bandofboats.com/fr/bateaux-a-vendre/voiliers-luxe") {
                        $('.col-12.col-sm-6.col-md-4.mb-5').each(function (index, element) {
                          var name = $(element).find('.search-card-content-title h3').text().trim();
                          var year = $(element).find('.search-card-content-title span').first().text().trim();
                          var location = $(element).find('.search-card-content-title span').last().text().trim();
                          var description = $(element).find('.search-card-content-characteristics-row').text().trim();
                          var price = $(element).find('.font-price').text().trim();
                          var priceType = $(element).find('.search-card-content-pricing .badge-pro').text().trim();
                          listings.push({
                            name: name,
                            year: year,
                            location: location,
                            description: description,
                            price: price,
                            priceType: priceType
                          });
                        });
                        console.log(listings);

                        _upsertResults2 = function _upsertResults2(listings) {
                          var _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, result, name, description, technicalDetails, price, userReviews, imageUrl, productUrl, _country5;

                          return regeneratorRuntime.async(function _upsertResults2$(_context7) {
                            while (1) {
                              switch (_context7.prev = _context7.next) {
                                case 0:
                                  _iteratorNormalCompletion4 = true;
                                  _didIteratorError4 = false;
                                  _iteratorError4 = undefined;
                                  _context7.prev = 3;
                                  _iterator4 = listings[Symbol.iterator]();

                                case 5:
                                  if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                                    _context7.next = 15;
                                    break;
                                  }

                                  result = _step4.value;
                                  name = result.name, description = result.description, technicalDetails = result.technicalDetails, price = result.price, userReviews = result.userReviews, imageUrl = result.imageUrl, productUrl = result.productUrl, _country5 = result.country;
                                  _context7.next = 10;
                                  return regeneratorRuntime.awrap(yacht.upsert({
                                    name: name,
                                    description: description,
                                    technicalDetails: technicalDetails,
                                    price: price,
                                    userReviews: userReviews,
                                    imageUrl: imageUrl,
                                    productUrl: productUrl,
                                    country: _country5
                                  }));

                                case 10:
                                  _context7.next = 12;
                                  return regeneratorRuntime.awrap(delay(500));

                                case 12:
                                  _iteratorNormalCompletion4 = true;
                                  _context7.next = 5;
                                  break;

                                case 15:
                                  _context7.next = 21;
                                  break;

                                case 17:
                                  _context7.prev = 17;
                                  _context7.t0 = _context7["catch"](3);
                                  _didIteratorError4 = true;
                                  _iteratorError4 = _context7.t0;

                                case 21:
                                  _context7.prev = 21;
                                  _context7.prev = 22;

                                  if (!_iteratorNormalCompletion4 && _iterator4["return"] != null) {
                                    _iterator4["return"]();
                                  }

                                case 24:
                                  _context7.prev = 24;

                                  if (!_didIteratorError4) {
                                    _context7.next = 27;
                                    break;
                                  }

                                  throw _iteratorError4;

                                case 27:
                                  return _context7.finish(24);

                                case 28:
                                  return _context7.finish(21);

                                case 29:
                                case "end":
                                  return _context7.stop();
                              }
                            }
                          }, null, null, [[3, 17, 21, 29], [22,, 24, 28]]);
                        };

                        _upsertResults2(listings).then(function () {
                          console.log('Upsert operations completed.');
                        });
                      } else {
                        console.log('Scraped Data1:');
                      }

                    _context8.next = 31;
                    return regeneratorRuntime.awrap(sleep(3000));

                  case 31:
                    console.log('Scraped Data1dd:', listings);
                    _context8.next = 34;
                    return regeneratorRuntime.awrap(browser.close());

                  case 34:
                  case "end":
                    return _context8.stop();
                }
              }
            });
          });
          /*$('div.search-card-content-pricing').each((i, element) => {
            const Element = $(element);
            const name = Element.find('h3').text()||Element.find('h1, h2, h3').text()
            const description = Element.find('p').text().trim() ||Element.find('.search-card-content-characteristics-desktop span') || "No description found";
            const priceElement1 =Element.find('span.price').text()||Element.find('div.fw-semibold.font-price.text-primary.text-nowrap').text()||Element.text().match(/(\d+[\.,]?\d*\s?(€|EUR|USD|$\$))/)[0].trim() ||Element.find('font-price').trim()||Element.find('div.fw-semibold font-price text-primary text-nowrap d-flex align-items-center mr-5 mr-md-0').first().trim() ||  "No price found";;
            const price2 = priceElement1.trim();
            const link = Element.find('a').attr('href') || "No link found";
            listings.push({ name, price2, link, 
               });
          });*/
          //console.log('Scraped Data1:', listings);
          //return boatDetails,boats,listings;
          //return results;
          //return boats;
          //return listings;

        case 2:
        case "end":
          return _context9.stop();
      }
    }
  });
}

var scrapeYachtWorld2 = function scrapeYachtWorld2() {
  var browser, page, captchaSolution, listings, boats, delay, item1, _captchaSolution, content, $, item2, _captchaSolution2, content1, $1, yachtList, _captchaSolution3;

  return regeneratorRuntime.async(function scrapeYachtWorld2$(_context11) {
    while (1) {
      switch (_context11.prev = _context11.next) {
        case 0:
          _context11.next = 2;
          return regeneratorRuntime.awrap(puppeteer.launch({
            headless: true
          }));

        case 2:
          browser = _context11.sent;
          _context11.next = 5;
          return regeneratorRuntime.awrap(browser.newPage());

        case 5:
          page = _context11.sent;
          _context11.next = 8;
          return regeneratorRuntime.awrap(page.$('img.captcha'));

        case 8:
          if (!_context11.sent) {
            _context11.next = 18;
            break;
          }

          _context11.next = 11;
          return regeneratorRuntime.awrap(solveCaptcha(page));

        case 11:
          captchaSolution = _context11.sent;
          _context11.next = 14;
          return regeneratorRuntime.awrap(page.type('input[name="captcha"]', captchaSolution));

        case 14:
          _context11.next = 16;
          return regeneratorRuntime.awrap(page.click('button[type="submit"]'));

        case 16:
          _context11.next = 18;
          return regeneratorRuntime.awrap(page.waitForNavigation({
            waitUntil: 'domcontentloaded'
          }));

        case 18:
          //const z="$`aa`"
          // Wait for the CAPTCHA to be solved and the page to load
          //  const content = await page.content();
          // let $ = cheerio.load(content);
          listings = [];
          boats = [];

          delay = function delay(ms) {
            return new Promise(function (resolve) {
              return setTimeout(resolve, ms);
            });
          };

          item1 = "https://www.ayc.fr/voilier-occasion";
          _context11.next = 24;
          return regeneratorRuntime.awrap(page["goto"](item1
          /*, { timeout: 120000 }*/
          ));

        case 24:
          _context11.next = 26;
          return regeneratorRuntime.awrap(page.$('img.captcha'));

        case 26:
          if (!_context11.sent) {
            _context11.next = 36;
            break;
          }

          _context11.next = 29;
          return regeneratorRuntime.awrap(solveCaptcha(page));

        case 29:
          _captchaSolution = _context11.sent;
          _context11.next = 32;
          return regeneratorRuntime.awrap(page.type('input[name="captcha"]', _captchaSolution));

        case 32:
          _context11.next = 34;
          return regeneratorRuntime.awrap(page.click('button[type="submit"]'));

        case 34:
          _context11.next = 36;
          return regeneratorRuntime.awrap(page.waitForNavigation({
            waitUntil: 'domcontentloaded'
          }));

        case 36:
          _context11.next = 38;
          return regeneratorRuntime.awrap(page.content());

        case 38:
          content = _context11.sent;
          $ = cheerio.load(content);
          console.log('Scraped Data1ddd');
          $('.bloc-bateau').each(function _callee3(index, element) {
            var boat, delay, a;
            return regeneratorRuntime.async(function _callee3$(_context10) {
              while (1) {
                switch (_context10.prev = _context10.next) {
                  case 0:
                    boat = {};

                    delay = function delay(ms) {
                      return new Promise(function (resolve) {
                        return setTimeout(resolve, ms);
                      });
                    };

                    a = "https://www.ayc.fr";
                    boat.imageUrl = $(element).find('.bloc-bateau-visuel a img').attr('src');
                    boat.productUrl = "https://www.ayc.fr".concat($(element).find('.bloc-bateau-visuel a').attr('href'));
                    boat.price = $(element).find('.bloc-bateau-prix a').text().trim();
                    boat.name = $(element).find('.bloc-bateau-titre a').text().trim();
                    boat.description = $(element).find('.bloc-bateau-accroche a').text().trim();
                    boat.technicalDetails = $(element).find('.bloc-bateau-accroche a').text().trim();
                    boat.country = getCountryFromUrl(item1);
                    listings.push(boat); // await delay(4000);//console.log('Scraped Data1:', listings);

                  case 11:
                  case "end":
                    return _context10.stop();
                }
              }
            });
          }); //console.log(content)

          item2 = "https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale";
          _context11.next = 45;
          return regeneratorRuntime.awrap(page["goto"](item2, {
            timeout: 120000
          }));

        case 45:
          _context11.next = 47;
          return regeneratorRuntime.awrap(page.$('img.captcha'));

        case 47:
          if (!_context11.sent) {
            _context11.next = 57;
            break;
          }

          _context11.next = 50;
          return regeneratorRuntime.awrap(solveCaptcha(page));

        case 50:
          _captchaSolution2 = _context11.sent;
          _context11.next = 53;
          return regeneratorRuntime.awrap(page.type('input[name="captcha"]', _captchaSolution2));

        case 53:
          _context11.next = 55;
          return regeneratorRuntime.awrap(page.click('button[type="submit"]'));

        case 55:
          _context11.next = 57;
          return regeneratorRuntime.awrap(page.waitForNavigation({
            waitUntil: 'domcontentloaded'
          }));

        case 57:
          _context11.next = 59;
          return regeneratorRuntime.awrap(page.content());

        case 59:
          content1 = _context11.sent;
          $1 = cheerio.load(content1);
          yachtList = $('div.y-grid a.yp'); // Select all yacht listings

          console.log("content");
          yachtList.each(function (index, element) {
            var name = $1(element).find('h2.yp__title').text().trim();
            var priceText = $1(element).find('p.yp__sum span').text().trim();
            var priceMatch = priceText.match(/EUR\s([\d,]+)/); // Extract EUR and digits

            var price = $1(element).find('.yp__sum span').text().trim();
            var detailsList = $1(element).find('ul.yp__ms li.yp__msi');
            var link = $1(element).attr('href');
            var length = '',
                cabins = '',
                year = '',
                location = '';
            var imageUrl = $1(element).find('.yp__visual img.yp__caro-img').attr('src');
            var construction = $1(element).find('.yp__ms li:nth-child(3)').text().trim();
            detailsList.each(function (idx, el) {
              var text = $1(el).text().trim();

              if (text.includes('Longueur')) {
                length = text.replace('Longueur : ', '');
              } else if (text.includes('cabine(s)')) {
                cabins = text;
              } else if (text.includes('Chantier')) {
                year = text.split(',')[0].replace('Chantier ', '');
                location = text.split(', ').pop();
              }
            });
            var imageUrls = [];
            /*$('ul.glide__slides li.glide__slide picture img').each((index, element) => {
              const imgSrc = $(element).attr('src');
              if (imgSrc) {
                imageUrls.push(imgSrc);
              }
            });*/

            var r = "".concat(a).concat(imageUrl);
            var a = "https://www.burgessyachts.com";
            var description = "".concat(length, " ").concat(cabins);
            console.log('Yacht Name:', yachtName);
            console.log('Price:', price);
            console.log('Length:', "".concat(a).concat(imageUrl));
            console.log('Cabins:', lengthAndCabins);
            console.log('Year:', year);
            console.log('---', link);
            console.log('---', location);
            console.log('---', imageUrls);
            var aa = "";
            listings.push({
              name: name,
              price: price,
              description: description,
              detailsList: detailsList,
              aa: aa,
              year: year,
              r: r,
              link: link,
              country: country
            });
          });
          console.log(listings);
          item1 = "https://www.bandofboats.com/fr/bateaux-a-vendre/voiliers-luxe";
          _context11.next = 68;
          return regeneratorRuntime.awrap(page["goto"](item1, {
            timeout: 120000
          }));

        case 68:
          _context11.next = 70;
          return regeneratorRuntime.awrap(page.$('img.captcha'));

        case 70:
          if (!_context11.sent) {
            _context11.next = 80;
            break;
          }

          _context11.next = 73;
          return regeneratorRuntime.awrap(solveCaptcha(page));

        case 73:
          _captchaSolution3 = _context11.sent;
          _context11.next = 76;
          return regeneratorRuntime.awrap(page.type('input[name="captcha"]', _captchaSolution3));

        case 76:
          _context11.next = 78;
          return regeneratorRuntime.awrap(page.click('button[type="submit"]'));

        case 78:
          _context11.next = 80;
          return regeneratorRuntime.awrap(page.waitForNavigation({
            waitUntil: 'domcontentloaded'
          }));

        case 80:
          $('.col-12.col-sm-6.col-md-4.mb-5').each(function (index, element) {
            var name = $(element).find('.search-card-content-title h3').text().trim();
            var year = $(element).find('.search-card-content-title span').first().text().trim();
            var location = $(element).find('.search-card-content-title span').last().text().trim();
            var description = $(element).find('.search-card-content-characteristics-row').text().trim();
            var price = $(element).find('.font-price').text().trim();
            var priceType = $(element).find('.search-card-content-pricing .badge-pro').text().trim();
            listings.push({
              name: name,
              year: year,
              location: location,
              description: description,
              price: price,
              priceType: priceType
            });
          });
          console.log('Scraped Data1:', listings); //return listings
          //else{console.log('Scraped Data1:');}

          /*$('div.search-card-content-pricing').each((i, element) => {
            const Element = $(element);
            const name = Element.find('h3').text()||Element.find('h1, h2, h3').text()
            const description = Element.find('p').text().trim() ||Element.find('.search-card-content-characteristics-desktop span') || "No description found";
            const priceElement1 =Element.find('span.price').text()||Element.find('div.fw-semibold.font-price.text-primary.text-nowrap').text()||Element.text().match(/(\d+[\.,]?\d*\s?(€|EUR|USD|$\$))/)[0].trim() ||Element.find('font-price').trim()||Element.find('div.fw-semibold font-price text-primary text-nowrap d-flex align-items-center mr-5 mr-md-0').first().trim() ||  "No price found";;
            const price2 = priceElement1.trim();
            const link = Element.find('a').attr('href') || "No link found";
            listings.push({ name, price2, link, 
               });
          });*/
          //console.log('Scraped Data1:', listings);
          //return boatDetails,boats,listings;

          _context11.next = 84;
          return regeneratorRuntime.awrap(sleep(3000));

        case 84:
          _context11.next = 86;
          return regeneratorRuntime.awrap(browser.close());

        case 86:
          return _context11.abrupt("return", listings);

        case 87:
        case "end":
          return _context11.stop();
      }
    }
  });
};

function scrapeYachtWorld3() {
  var item1;
  return regeneratorRuntime.async(function scrapeYachtWorld3$(_context17) {
    while (1) {
      switch (_context17.prev = _context17.next) {
        case 0:
          item1 = "https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale";
          l = ["https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale", "https://www.ayc.fr/voilier-occasion"];
          l.forEach(function _callee5(item1, index) {
            var browser, page, captchaSolution, content, $, listings, boats, delay, yachtList, upsertResults, _upsertResults3, _upsertResults4;

            return regeneratorRuntime.async(function _callee5$(_context16) {
              while (1) {
                switch (_context16.prev = _context16.next) {
                  case 0:
                    _context16.next = 2;
                    return regeneratorRuntime.awrap(puppeteer.launch({
                      headless: true
                    }));

                  case 2:
                    browser = _context16.sent;
                    _context16.next = 5;
                    return regeneratorRuntime.awrap(browser.newPage());

                  case 5:
                    page = _context16.sent;
                    _context16.next = 8;
                    return regeneratorRuntime.awrap(page["goto"](item1));

                  case 8:
                    _context16.next = 10;
                    return regeneratorRuntime.awrap(page.$('img.captcha'));

                  case 10:
                    if (!_context16.sent) {
                      _context16.next = 20;
                      break;
                    }

                    _context16.next = 13;
                    return regeneratorRuntime.awrap(solveCaptcha(page));

                  case 13:
                    captchaSolution = _context16.sent;
                    _context16.next = 16;
                    return regeneratorRuntime.awrap(page.type('input[name="captcha"]', captchaSolution));

                  case 16:
                    _context16.next = 18;
                    return regeneratorRuntime.awrap(page.click('button[type="submit"]'));

                  case 18:
                    _context16.next = 20;
                    return regeneratorRuntime.awrap(page.waitForNavigation({
                      waitUntil: 'domcontentloaded'
                    }));

                  case 20:
                    _context16.next = 22;
                    return regeneratorRuntime.awrap(page.content());

                  case 22:
                    content = _context16.sent;
                    $ = cheerio.load(content);
                    listings = [];
                    boats = [];

                    delay = function delay(ms) {
                      return new Promise(function (resolve) {
                        return setTimeout(resolve, ms);
                      });
                    };

                    console.log(item1);

                    if (item1 = "https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale") {
                      yachtList = $('div.y-grid a.yp'); // Select all yacht listings

                      console.log('Scraped Data2ddd');
                      yachtList.each(function (index, element) {
                        var name = $(element).find('h2.yp__title').text().trim();
                        var priceText = $(element).find('p.yp__sum span').text().trim();
                        var priceMatch = priceText.match(/EUR\s([\d,]+)/); // Extract EUR and digits

                        var price = $(element).find('.yp__sum span').text().trim();
                        var detailsList = $(element).find('ul.yp__ms li.yp__msi');
                        var productUrl = $(element).attr('href');
                        var length = '',
                            cabins = '',
                            year = '',
                            country = '';
                        var imageUrla = $(element).find('.yp__visual img.yp__caro-img').attr('src');
                        var construction = $(element).find('.yp__ms li:nth-child(3)').text().trim();
                        detailsList.each(function (idx, el) {
                          var text = $(el).text().trim();

                          if (text.includes('Longueur')) {
                            length = text.replace('Longueur : ', '');
                          } else if (text.includes('cabine(s)')) {
                            cabins = text;
                          } else if (text.includes('Chantier')) {
                            year = text.split(',')[0].replace('Chantier ', '');
                            country = text.split(', ').pop();
                          }
                        });
                        var imageUrls = [];
                        /*$('ul.glide__slides li.glide__slide picture img').each((index, element) => {
                          const imgSrc = $(element).attr('src');
                          if (imgSrc) {
                            imageUrls.push(imgSrc);
                          }
                        });*/

                        var a = "https://www.burgessyachts.com";
                        var imageUrl = "".concat(a).concat(imageUrla);
                        var description = "".concat(length, " ").concat(cabins);
                        var technicalDetails = "".concat(length, " ").concat(cabins);
                        console.log('Yacht Name:', name);
                        console.log('Price:', price);
                        console.log('Length:', "".concat(a).concat(imageUrl));
                        console.log('Cabins:', description);
                        console.log('Year:', year);
                        console.log('---', productUrl);
                        console.log('---', country);
                        console.log('---', imageUrls);
                        var aa = "";
                        listings.push({
                          name: name,
                          description: description,
                          technicalDetails: technicalDetails,
                          price: price,
                          aa: aa,
                          year: year,
                          imageUrl: imageUrl,
                          productUrl: productUrl,
                          country: country
                        });
                        console.log(listings);
                      });

                      upsertResults = function upsertResults(listings) {
                        var _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, result, name, description, technicalDetails, price, userReviews, imageUrl, productUrl, _country6;

                        return regeneratorRuntime.async(function upsertResults$(_context12) {
                          while (1) {
                            switch (_context12.prev = _context12.next) {
                              case 0:
                                _iteratorNormalCompletion5 = true;
                                _didIteratorError5 = false;
                                _iteratorError5 = undefined;
                                _context12.prev = 3;
                                _iterator5 = listings[Symbol.iterator]();

                              case 5:
                                if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
                                  _context12.next = 15;
                                  break;
                                }

                                result = _step5.value;
                                name = result.name, description = result.description, technicalDetails = result.technicalDetails, price = result.price, userReviews = result.userReviews, imageUrl = result.imageUrl, productUrl = result.productUrl, _country6 = result.country;
                                _context12.next = 10;
                                return regeneratorRuntime.awrap(yacht.Create({
                                  name: name,
                                  description: description,
                                  technicalDetails: technicalDetails,
                                  price: price,
                                  userReviews: userReviews,
                                  imageUrl: imageUrl,
                                  productUrl: productUrl,
                                  country: _country6
                                }));

                              case 10:
                                _context12.next = 12;
                                return regeneratorRuntime.awrap(delay(500));

                              case 12:
                                _iteratorNormalCompletion5 = true;
                                _context12.next = 5;
                                break;

                              case 15:
                                _context12.next = 21;
                                break;

                              case 17:
                                _context12.prev = 17;
                                _context12.t0 = _context12["catch"](3);
                                _didIteratorError5 = true;
                                _iteratorError5 = _context12.t0;

                              case 21:
                                _context12.prev = 21;
                                _context12.prev = 22;

                                if (!_iteratorNormalCompletion5 && _iterator5["return"] != null) {
                                  _iterator5["return"]();
                                }

                              case 24:
                                _context12.prev = 24;

                                if (!_didIteratorError5) {
                                  _context12.next = 27;
                                  break;
                                }

                                throw _iteratorError5;

                              case 27:
                                return _context12.finish(24);

                              case 28:
                                return _context12.finish(21);

                              case 29:
                              case "end":
                                return _context12.stop();
                            }
                          }
                        }, null, null, [[3, 17, 21, 29], [22,, 24, 28]]);
                      };

                      upsertResults(listings).then(function () {
                        console.log('Upsert operations completed.');
                      });
                    } else if (item1 = "https://www.ayc.fr/voilier-occasion") {
                      console.log('Scraped Data1ddd');
                      $('.bloc-bateau').each(function _callee4(index, element) {
                        var boat, delay, a;
                        return regeneratorRuntime.async(function _callee4$(_context13) {
                          while (1) {
                            switch (_context13.prev = _context13.next) {
                              case 0:
                                boat = {};

                                delay = function delay(ms) {
                                  return new Promise(function (resolve) {
                                    return setTimeout(resolve, ms);
                                  });
                                };

                                a = "https://www.ayc.fr";
                                boat.imageUrl = $(element).find('.bloc-bateau-visuel a img').attr('src');
                                boat.productUrl = "https://www.ayc.fr".concat($(element).find('.bloc-bateau-visuel a').attr('href'));
                                boat.price = $(element).find('.bloc-bateau-prix a').text().trim();
                                boat.name = $(element).find('.bloc-bateau-titre a').text().trim();
                                boat.description = $(element).find('.bloc-bateau-accroche a').text().trim();
                                boat.technicalDetails = $(element).find('.bloc-bateau-accroche a').text().trim();
                                boat.country = getCountryFromUrl(item1);
                                listings.push(boat); //await delay(4000);//console.log('Scraped Data1:', listings);

                              case 11:
                              case "end":
                                return _context13.stop();
                            }
                          }
                        });
                      });

                      _upsertResults3 = function _upsertResults3(listings) {
                        var _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, result, name, description, technicalDetails, price, userReviews, imageUrl, productUrl, _country7;

                        return regeneratorRuntime.async(function _upsertResults3$(_context14) {
                          while (1) {
                            switch (_context14.prev = _context14.next) {
                              case 0:
                                _iteratorNormalCompletion6 = true;
                                _didIteratorError6 = false;
                                _iteratorError6 = undefined;
                                _context14.prev = 3;
                                _iterator6 = listings[Symbol.iterator]();

                              case 5:
                                if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
                                  _context14.next = 15;
                                  break;
                                }

                                result = _step6.value;
                                name = result.name, description = result.description, technicalDetails = result.technicalDetails, price = result.price, userReviews = result.userReviews, imageUrl = result.imageUrl, productUrl = result.productUrl, _country7 = result.country;
                                _context14.next = 10;
                                return regeneratorRuntime.awrap(yacht.upsert({
                                  name: name,
                                  description: description,
                                  technicalDetails: technicalDetails,
                                  price: price,
                                  userReviews: userReviews,
                                  imageUrl: imageUrl,
                                  productUrl: productUrl,
                                  country: _country7
                                }));

                              case 10:
                                _context14.next = 12;
                                return regeneratorRuntime.awrap(delay(500));

                              case 12:
                                _iteratorNormalCompletion6 = true;
                                _context14.next = 5;
                                break;

                              case 15:
                                _context14.next = 21;
                                break;

                              case 17:
                                _context14.prev = 17;
                                _context14.t0 = _context14["catch"](3);
                                _didIteratorError6 = true;
                                _iteratorError6 = _context14.t0;

                              case 21:
                                _context14.prev = 21;
                                _context14.prev = 22;

                                if (!_iteratorNormalCompletion6 && _iterator6["return"] != null) {
                                  _iterator6["return"]();
                                }

                              case 24:
                                _context14.prev = 24;

                                if (!_didIteratorError6) {
                                  _context14.next = 27;
                                  break;
                                }

                                throw _iteratorError6;

                              case 27:
                                return _context14.finish(24);

                              case 28:
                                return _context14.finish(21);

                              case 29:
                              case "end":
                                return _context14.stop();
                            }
                          }
                        }, null, null, [[3, 17, 21, 29], [22,, 24, 28]]);
                      };

                      _upsertResults3(listings).then(function () {
                        console.log('Upsert operations completed.');
                      });
                    } //console.log(content)
                    else if (item1 = "https://www.bandofboats.com/fr/bateaux-a-vendre/voiliers-luxe") {
                        $('.col-12.col-sm-6.col-md-4.mb-5').each(function (index, element) {
                          var name = $(element).find('.search-card-content-title h3').text().trim();
                          var year = $(element).find('.search-card-content-title span').first().text().trim();
                          var location = $(element).find('.search-card-content-title span').last().text().trim();
                          var description = $(element).find('.search-card-content-characteristics-row').text().trim();
                          var price = $(element).find('.font-price').text().trim();
                          var priceType = $(element).find('.search-card-content-pricing .badge-pro').text().trim();
                          listings.push({
                            name: name,
                            year: year,
                            location: location,
                            description: description,
                            price: price,
                            priceType: priceType
                          });
                        });
                        console.log(listings);

                        _upsertResults4 = function _upsertResults4(listings) {
                          var _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, result, name, description, technicalDetails, price, userReviews, imageUrl, productUrl, _country8;

                          return regeneratorRuntime.async(function _upsertResults4$(_context15) {
                            while (1) {
                              switch (_context15.prev = _context15.next) {
                                case 0:
                                  _iteratorNormalCompletion7 = true;
                                  _didIteratorError7 = false;
                                  _iteratorError7 = undefined;
                                  _context15.prev = 3;
                                  _iterator7 = listings[Symbol.iterator]();

                                case 5:
                                  if (_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done) {
                                    _context15.next = 15;
                                    break;
                                  }

                                  result = _step7.value;
                                  name = result.name, description = result.description, technicalDetails = result.technicalDetails, price = result.price, userReviews = result.userReviews, imageUrl = result.imageUrl, productUrl = result.productUrl, _country8 = result.country;
                                  _context15.next = 10;
                                  return regeneratorRuntime.awrap(yacht.upsert({
                                    name: name,
                                    description: description,
                                    technicalDetails: technicalDetails,
                                    price: price,
                                    userReviews: userReviews,
                                    imageUrl: imageUrl,
                                    productUrl: productUrl,
                                    country: _country8
                                  }));

                                case 10:
                                  _context15.next = 12;
                                  return regeneratorRuntime.awrap(delay(500));

                                case 12:
                                  _iteratorNormalCompletion7 = true;
                                  _context15.next = 5;
                                  break;

                                case 15:
                                  _context15.next = 21;
                                  break;

                                case 17:
                                  _context15.prev = 17;
                                  _context15.t0 = _context15["catch"](3);
                                  _didIteratorError7 = true;
                                  _iteratorError7 = _context15.t0;

                                case 21:
                                  _context15.prev = 21;
                                  _context15.prev = 22;

                                  if (!_iteratorNormalCompletion7 && _iterator7["return"] != null) {
                                    _iterator7["return"]();
                                  }

                                case 24:
                                  _context15.prev = 24;

                                  if (!_didIteratorError7) {
                                    _context15.next = 27;
                                    break;
                                  }

                                  throw _iteratorError7;

                                case 27:
                                  return _context15.finish(24);

                                case 28:
                                  return _context15.finish(21);

                                case 29:
                                case "end":
                                  return _context15.stop();
                              }
                            }
                          }, null, null, [[3, 17, 21, 29], [22,, 24, 28]]);
                        };

                        _upsertResults4(listings).then(function () {
                          console.log('Upsert operations completed.');
                        });
                      } else {
                        console.log('Scraped Data1:');
                      }

                    _context16.next = 31;
                    return regeneratorRuntime.awrap(sleep(3000));

                  case 31:
                    console.log('Scraped Data1dd:', listings);
                    _context16.next = 34;
                    return regeneratorRuntime.awrap(browser.close());

                  case 34:
                  case "end":
                    return _context16.stop();
                }
              }
            });
          });
          /*$('div.search-card-content-pricing').each((i, element) => {
            const Element = $(element);
            const name = Element.find('h3').text()||Element.find('h1, h2, h3').text()
            const description = Element.find('p').text().trim() ||Element.find('.search-card-content-characteristics-desktop span') || "No description found";
            const priceElement1 =Element.find('span.price').text()||Element.find('div.fw-semibold.font-price.text-primary.text-nowrap').text()||Element.text().match(/(\d+[\.,]?\d*\s?(€|EUR|USD|$\$))/)[0].trim() ||Element.find('font-price').trim()||Element.find('div.fw-semibold font-price text-primary text-nowrap d-flex align-items-center mr-5 mr-md-0').first().trim() ||  "No price found";;
            const price2 = priceElement1.trim();
            const link = Element.find('a').attr('href') || "No link found";
            listings.push({ name, price2, link, 
               });
          });*/
          //console.log('Scraped Data1:', listings);
          //return boatDetails,boats,listings;
          //return results;
          //return boats;
          //return listings;

        case 3:
        case "end":
          return _context17.stop();
      }
    }
  });
}

function updateDatabase2() {
  var delay, results, upsertResults;
  return regeneratorRuntime.async(function updateDatabase2$(_context19) {
    while (1) {
      switch (_context19.prev = _context19.next) {
        case 0:
          delay = function delay(ms) {
            return new Promise(function (resolve) {
              return setTimeout(resolve, ms);
            });
          };

          _context19.next = 3;
          return regeneratorRuntime.awrap(scrapeYachtWorld1());

        case 3:
          results = _context19.sent;
          console.log('ee', results);

          upsertResults = function upsertResults(results) {
            var _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, result, name, description, technicalDetails, price, userReviews, imageUrl, productUrl, _country9;

            return regeneratorRuntime.async(function upsertResults$(_context18) {
              while (1) {
                switch (_context18.prev = _context18.next) {
                  case 0:
                    _iteratorNormalCompletion8 = true;
                    _didIteratorError8 = false;
                    _iteratorError8 = undefined;
                    _context18.prev = 3;
                    _iterator8 = results[Symbol.iterator]();

                  case 5:
                    if (_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done) {
                      _context18.next = 15;
                      break;
                    }

                    result = _step8.value;
                    name = result.name, description = result.description, technicalDetails = result.technicalDetails, price = result.price, userReviews = result.userReviews, imageUrl = result.imageUrl, productUrl = result.productUrl, _country9 = result.country;
                    _context18.next = 10;
                    return regeneratorRuntime.awrap(yacht.upsert({
                      name: name,
                      description: description,
                      technicalDetails: technicalDetails,
                      price: price,
                      userReviews: userReviews,
                      imageUrl: imageUrl,
                      productUrl: productUrl,
                      country: _country9
                    }));

                  case 10:
                    _context18.next = 12;
                    return regeneratorRuntime.awrap(delay(500));

                  case 12:
                    _iteratorNormalCompletion8 = true;
                    _context18.next = 5;
                    break;

                  case 15:
                    _context18.next = 21;
                    break;

                  case 17:
                    _context18.prev = 17;
                    _context18.t0 = _context18["catch"](3);
                    _didIteratorError8 = true;
                    _iteratorError8 = _context18.t0;

                  case 21:
                    _context18.prev = 21;
                    _context18.prev = 22;

                    if (!_iteratorNormalCompletion8 && _iterator8["return"] != null) {
                      _iterator8["return"]();
                    }

                  case 24:
                    _context18.prev = 24;

                    if (!_didIteratorError8) {
                      _context18.next = 27;
                      break;
                    }

                    throw _iteratorError8;

                  case 27:
                    return _context18.finish(24);

                  case 28:
                    return _context18.finish(21);

                  case 29:
                  case "end":
                    return _context18.stop();
                }
              }
            }, null, null, [[3, 17, 21, 29], [22,, 24, 28]]);
          };

          upsertResults(results).then(function () {
            console.log('Upsert operations completed.');
          }); //console.log('Données mises à jour dans la base de données');

        case 7:
        case "end":
          return _context19.stop();
      }
    }
  });
} //scrapeYachtWorld2()   


l = ["https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale", "https://www.ayc.fr/voilier-occasion"];

function updateDatabase1() {
  var results, upsertResults;
  return regeneratorRuntime.async(function updateDatabase1$(_context21) {
    while (1) {
      switch (_context21.prev = _context21.next) {
        case 0:
          _context21.next = 2;
          return regeneratorRuntime.awrap(scrapeYachtWorld1());

        case 2:
          results = _context21.sent;
          console.log('ee', results);

          upsertResults = function upsertResults(results) {
            var _iteratorNormalCompletion9, _didIteratorError9, _iteratorError9, _iterator9, _step9, result, name, description, technicalDetails, price, userReviews, imageUrl, productUrl, _country10;

            return regeneratorRuntime.async(function upsertResults$(_context20) {
              while (1) {
                switch (_context20.prev = _context20.next) {
                  case 0:
                    _iteratorNormalCompletion9 = true;
                    _didIteratorError9 = false;
                    _iteratorError9 = undefined;
                    _context20.prev = 3;
                    _iterator9 = results[Symbol.iterator]();

                  case 5:
                    if (_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done) {
                      _context20.next = 15;
                      break;
                    }

                    result = _step9.value;
                    name = result.name, description = result.description, technicalDetails = result.technicalDetails, price = result.price, userReviews = result.userReviews, imageUrl = result.imageUrl, productUrl = result.productUrl, _country10 = result.country;
                    _context20.next = 10;
                    return regeneratorRuntime.awrap(yacht.upsert({
                      name: name,
                      description: description,
                      technicalDetails: technicalDetails,
                      price: price,
                      userReviews: userReviews,
                      imageUrl: imageUrl,
                      productUrl: productUrl,
                      country: _country10
                    }));

                  case 10:
                    _context20.next = 12;
                    return regeneratorRuntime.awrap(delay(500));

                  case 12:
                    _iteratorNormalCompletion9 = true;
                    _context20.next = 5;
                    break;

                  case 15:
                    _context20.next = 21;
                    break;

                  case 17:
                    _context20.prev = 17;
                    _context20.t0 = _context20["catch"](3);
                    _didIteratorError9 = true;
                    _iteratorError9 = _context20.t0;

                  case 21:
                    _context20.prev = 21;
                    _context20.prev = 22;

                    if (!_iteratorNormalCompletion9 && _iterator9["return"] != null) {
                      _iterator9["return"]();
                    }

                  case 24:
                    _context20.prev = 24;

                    if (!_didIteratorError9) {
                      _context20.next = 27;
                      break;
                    }

                    throw _iteratorError9;

                  case 27:
                    return _context20.finish(24);

                  case 28:
                    return _context20.finish(21);

                  case 29:
                  case "end":
                    return _context20.stop();
                }
              }
            }, null, null, [[3, 17, 21, 29], [22,, 24, 28]]);
          };

          upsertResults(results).then(function () {
            console.log('Upsert operations completed.');
          }); //console.log('Données mises à jour dans la base de données');

        case 6:
        case "end":
          return _context21.stop();
      }
    }
  });
}

function scrapeYachtWorld4() {
  var item1, browser, page, captchaSolution, content, $, listings, boats, delay, yachtList, upsertResults;
  return regeneratorRuntime.async(function scrapeYachtWorld4$(_context23) {
    while (1) {
      switch (_context23.prev = _context23.next) {
        case 0:
          item1 = "https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale";
          _context23.next = 3;
          return regeneratorRuntime.awrap(puppeteer.launch({
            headless: true
          }));

        case 3:
          browser = _context23.sent;
          _context23.next = 6;
          return regeneratorRuntime.awrap(browser.newPage());

        case 6:
          page = _context23.sent;
          _context23.next = 9;
          return regeneratorRuntime.awrap(page["goto"](item1));

        case 9:
          _context23.next = 11;
          return regeneratorRuntime.awrap(page.$('img.captcha'));

        case 11:
          if (!_context23.sent) {
            _context23.next = 21;
            break;
          }

          _context23.next = 14;
          return regeneratorRuntime.awrap(solveCaptcha(page));

        case 14:
          captchaSolution = _context23.sent;
          _context23.next = 17;
          return regeneratorRuntime.awrap(page.type('input[name="captcha"]', captchaSolution));

        case 17:
          _context23.next = 19;
          return regeneratorRuntime.awrap(page.click('button[type="submit"]'));

        case 19:
          _context23.next = 21;
          return regeneratorRuntime.awrap(page.waitForNavigation({
            waitUntil: 'domcontentloaded'
          }));

        case 21:
          _context23.next = 23;
          return regeneratorRuntime.awrap(page.content());

        case 23:
          content = _context23.sent;
          $ = cheerio.load(content);
          listings = [];
          boats = [];

          delay = function delay(ms) {
            return new Promise(function (resolve) {
              return setTimeout(resolve, ms);
            });
          };

          yachtList = $('div.y-grid a.yp'); // Select all yacht listings

          yachtList.each(function (index, element) {
            var name = $(element).find('h2.yp__title').text().trim();
            var priceText = $(element).find('p.yp__sum span').text().trim();
            var priceMatch = priceText.match(/EUR\s([\d,]+)/); // Extract EUR and digits

            var price = $(element).find('.yp__sum span').text().trim();
            var detailsList = $(element).find('ul.yp__ms li.yp__msi');
            var productUrl = $(element).attr('href');
            var length = '',
                cabins = '',
                year = '',
                country = '';
            var imageUrla = $(element).find('.yp__visual img.yp__caro-img').attr('src');
            var construction = $(element).find('.yp__ms li:nth-child(3)').text().trim();
            detailsList.each(function (idx, el) {
              var text = $(el).text().trim();

              if (text.includes('Longueur')) {
                length = text.replace('Longueur : ', '');
              } else if (text.includes('cabine(s)')) {
                cabins = text;
              } else if (text.includes('Chantier')) {
                year = text.split(',')[0].replace('Chantier ', '');
                country = text.split(', ').pop();
              }
            });
            var imageUrls = [];
            var a = "https://www.burgessyachts.com";
            var imageUrl = "".concat(a).concat(imageUrla);
            var description = "".concat(length, " ").concat(cabins);
            var technicalDetails = "".concat(length, " ").concat(cabins);
            var aa = "";
            listings.push({
              name: name,
              description: description,
              technicalDetails: technicalDetails,
              price: price,
              aa: aa,
              year: year,
              imageUrl: imageUrl,
              productUrl: productUrl,
              country: country
            });
            console.log(listings);
          });

          upsertResults = function upsertResults(listings) {
            var _iteratorNormalCompletion10, _didIteratorError10, _iteratorError10, _iterator10, _step10, result, name, description, technicalDetails, price, userReviews, imageUrl, productUrl, _country11;

            return regeneratorRuntime.async(function upsertResults$(_context22) {
              while (1) {
                switch (_context22.prev = _context22.next) {
                  case 0:
                    _iteratorNormalCompletion10 = true;
                    _didIteratorError10 = false;
                    _iteratorError10 = undefined;
                    _context22.prev = 3;
                    _iterator10 = listings[Symbol.iterator]();

                  case 5:
                    if (_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done) {
                      _context22.next = 15;
                      break;
                    }

                    result = _step10.value;
                    name = result.name, description = result.description, technicalDetails = result.technicalDetails, price = result.price, userReviews = result.userReviews, imageUrl = result.imageUrl, productUrl = result.productUrl, _country11 = result.country;
                    _context22.next = 10;
                    return regeneratorRuntime.awrap(yacht.upsert({
                      name: name,
                      description: description,
                      technicalDetails: technicalDetails,
                      price: price,
                      userReviews: userReviews,
                      imageUrl: imageUrl,
                      productUrl: productUrl,
                      country: _country11
                    }));

                  case 10:
                    _context22.next = 12;
                    return regeneratorRuntime.awrap(delay(200));

                  case 12:
                    _iteratorNormalCompletion10 = true;
                    _context22.next = 5;
                    break;

                  case 15:
                    _context22.next = 21;
                    break;

                  case 17:
                    _context22.prev = 17;
                    _context22.t0 = _context22["catch"](3);
                    _didIteratorError10 = true;
                    _iteratorError10 = _context22.t0;

                  case 21:
                    _context22.prev = 21;
                    _context22.prev = 22;

                    if (!_iteratorNormalCompletion10 && _iterator10["return"] != null) {
                      _iterator10["return"]();
                    }

                  case 24:
                    _context22.prev = 24;

                    if (!_didIteratorError10) {
                      _context22.next = 27;
                      break;
                    }

                    throw _iteratorError10;

                  case 27:
                    return _context22.finish(24);

                  case 28:
                    return _context22.finish(21);

                  case 29:
                  case "end":
                    return _context22.stop();
                }
              }
            }, null, null, [[3, 17, 21, 29], [22,, 24, 28]]);
          };

          upsertResults(listings).then(function () {
            console.log('Upsert operations completed.');
          });
          _context23.next = 34;
          return regeneratorRuntime.awrap(sleep(3000));

        case 34:
          console.log('Scraped Data1dd:', listings);
          _context23.next = 37;
          return regeneratorRuntime.awrap(browser.close());

        case 37:
        case "end":
          return _context23.stop();
      }
    }
  });
}

function scrapeYachtWorld5() {
  var item1, browser, page, captchaSolution, content, $, listings, boats, delay, upsertResults;
  return regeneratorRuntime.async(function scrapeYachtWorld5$(_context26) {
    while (1) {
      switch (_context26.prev = _context26.next) {
        case 0:
          item1 = "https://www.ayc.fr/voilier-occasion";
          _context26.next = 3;
          return regeneratorRuntime.awrap(puppeteer.launch({
            headless: true
          }));

        case 3:
          browser = _context26.sent;
          _context26.next = 6;
          return regeneratorRuntime.awrap(browser.newPage());

        case 6:
          page = _context26.sent;
          _context26.next = 9;
          return regeneratorRuntime.awrap(page["goto"](item1));

        case 9:
          _context26.next = 11;
          return regeneratorRuntime.awrap(page.$('img.captcha'));

        case 11:
          if (!_context26.sent) {
            _context26.next = 21;
            break;
          }

          _context26.next = 14;
          return regeneratorRuntime.awrap(solveCaptcha(page));

        case 14:
          captchaSolution = _context26.sent;
          _context26.next = 17;
          return regeneratorRuntime.awrap(page.type('input[name="captcha"]', captchaSolution));

        case 17:
          _context26.next = 19;
          return regeneratorRuntime.awrap(page.click('button[type="submit"]'));

        case 19:
          _context26.next = 21;
          return regeneratorRuntime.awrap(page.waitForNavigation({
            waitUntil: 'domcontentloaded'
          }));

        case 21:
          _context26.next = 23;
          return regeneratorRuntime.awrap(page.content());

        case 23:
          content = _context26.sent;
          $ = cheerio.load(content);
          listings = [];
          boats = [];

          delay = function delay(ms) {
            return new Promise(function (resolve) {
              return setTimeout(resolve, ms);
            });
          };

          $('.bloc-bateau').each(function _callee6(index, element) {
            var boat, delay;
            return regeneratorRuntime.async(function _callee6$(_context24) {
              while (1) {
                switch (_context24.prev = _context24.next) {
                  case 0:
                    boat = {};

                    delay = function delay(ms) {
                      return new Promise(function (resolve) {
                        return setTimeout(resolve, ms);
                      });
                    };

                    boat.imageUrl = $(element).find('.bloc-bateau-visuel a img').attr('src');
                    boat.productUrl = "https://www.ayc.fr".concat($(element).find('.bloc-bateau-visuel a').attr('href'));
                    boat.price = $(element).find('.bloc-bateau-prix a').text().trim();
                    boat.name = $(element).find('.bloc-bateau-titre a').text().trim();
                    boat.description = $(element).find('.bloc-bateau-accroche a').text().trim();
                    boat.technicalDetails = $(element).find('.bloc-bateau-accroche a').text().trim();
                    boat.country = getCountryFromUrl(item1);
                    listings.push(boat); //await delay(500);//console.log('Scraped Data1:', listings);

                  case 10:
                  case "end":
                    return _context24.stop();
                }
              }
            });
          });

          upsertResults = function upsertResults(listings) {
            var _iteratorNormalCompletion11, _didIteratorError11, _iteratorError11, _iterator11, _step11, result, name, description, technicalDetails, price, userReviews, imageUrl, productUrl, _country12;

            return regeneratorRuntime.async(function upsertResults$(_context25) {
              while (1) {
                switch (_context25.prev = _context25.next) {
                  case 0:
                    _iteratorNormalCompletion11 = true;
                    _didIteratorError11 = false;
                    _iteratorError11 = undefined;
                    _context25.prev = 3;
                    _iterator11 = listings[Symbol.iterator]();

                  case 5:
                    if (_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done) {
                      _context25.next = 15;
                      break;
                    }

                    result = _step11.value;
                    name = result.name, description = result.description, technicalDetails = result.technicalDetails, price = result.price, userReviews = result.userReviews, imageUrl = result.imageUrl, productUrl = result.productUrl, _country12 = result.country;
                    _context25.next = 10;
                    return regeneratorRuntime.awrap(yacht.upsert({
                      name: name,
                      description: description,
                      technicalDetails: technicalDetails,
                      price: price,
                      userReviews: userReviews,
                      imageUrl: imageUrl,
                      productUrl: productUrl,
                      country: _country12
                    }));

                  case 10:
                    _context25.next = 12;
                    return regeneratorRuntime.awrap(delay(300));

                  case 12:
                    _iteratorNormalCompletion11 = true;
                    _context25.next = 5;
                    break;

                  case 15:
                    _context25.next = 21;
                    break;

                  case 17:
                    _context25.prev = 17;
                    _context25.t0 = _context25["catch"](3);
                    _didIteratorError11 = true;
                    _iteratorError11 = _context25.t0;

                  case 21:
                    _context25.prev = 21;
                    _context25.prev = 22;

                    if (!_iteratorNormalCompletion11 && _iterator11["return"] != null) {
                      _iterator11["return"]();
                    }

                  case 24:
                    _context25.prev = 24;

                    if (!_didIteratorError11) {
                      _context25.next = 27;
                      break;
                    }

                    throw _iteratorError11;

                  case 27:
                    return _context25.finish(24);

                  case 28:
                    return _context25.finish(21);

                  case 29:
                  case "end":
                    return _context25.stop();
                }
              }
            }, null, null, [[3, 17, 21, 29], [22,, 24, 28]]);
          };

          upsertResults(listings).then(function () {
            console.log('Upsert operations completed.');
          });

        case 31:
        case "end":
          return _context26.stop();
      }
    }
  });
} //scrapeYachtWorld4()
//scrapeYachtWorld5()


function loopThroughList(list) {
  // Check if the input is an array
  if (Array.isArray(list)) {
    list.forEach(function (item, index) {
      // Perform an action with each item
      // scrapeYachtWorld1(item)
      updateDatabase1(item); // Example condition-based actions

      if (typeof item === 'string') {
        // console.log(`String item: ${item.toUpperCase()}`);
        var getCountryFromUrl1 = function getCountryFromUrl1(item) {
          var domain = item.split('/')[2];
          var countryTLDs = {
            'fr': 'France',
            'de': 'Germany',
            'it': 'Italy',
            'es': 'Spain',
            'co.uk': 'United Kingdom',
            'com': 'International'
          };

          for (var _i2 = 0, _Object$entries2 = Object.entries(countryTLDs); _i2 < _Object$entries2.length; _i2++) {
            var _Object$entries2$_i = _slicedToArray(_Object$entries2[_i2], 2),
                tld = _Object$entries2$_i[0],
                _country13 = _Object$entries2$_i[1];

            if (domain.endsWith(tld)) {
              return _country13;
            }
          }

          return 'Unknown';
        };
      } else if (typeof item === 'number') {
        console.log("Number item: ".concat(item * 2));
      } else {
        console.log("Other type: ".concat(item));
      }
    });
  } else {
    console.error('The provided input is not an array.');
  }
}

function scrapeYachtWorld6() {
  var browser, page, captchaSolution, content, $, listings, boats, delay;
  return regeneratorRuntime.async(function scrapeYachtWorld6$(_context27) {
    while (1) {
      switch (_context27.prev = _context27.next) {
        case 0:
          item1 = "https://www.bandofboats.com/fr/bateaux-a-vendre/voiliers-luxe";
          _context27.next = 3;
          return regeneratorRuntime.awrap(puppeteer.launch({
            headless: true
          }));

        case 3:
          browser = _context27.sent;
          _context27.next = 6;
          return regeneratorRuntime.awrap(browser.newPage());

        case 6:
          page = _context27.sent;
          _context27.next = 9;
          return regeneratorRuntime.awrap(page["goto"](item1));

        case 9:
          _context27.next = 11;
          return regeneratorRuntime.awrap(page.$('img.captcha'));

        case 11:
          if (!_context27.sent) {
            _context27.next = 21;
            break;
          }

          _context27.next = 14;
          return regeneratorRuntime.awrap(solveCaptcha(page));

        case 14:
          captchaSolution = _context27.sent;
          _context27.next = 17;
          return regeneratorRuntime.awrap(page.type('input[name="captcha"]', captchaSolution));

        case 17:
          _context27.next = 19;
          return regeneratorRuntime.awrap(page.click('button[type="submit"]'));

        case 19:
          _context27.next = 21;
          return regeneratorRuntime.awrap(page.waitForNavigation({
            waitUntil: 'domcontentloaded'
          }));

        case 21:
          _context27.next = 23;
          return regeneratorRuntime.awrap(page.content());

        case 23:
          content = _context27.sent;
          $ = cheerio.load(content);
          listings = [];
          boats = [];

          delay = function delay(ms) {
            return new Promise(function (resolve) {
              return setTimeout(resolve, ms);
            });
          };

          $('div.row col-12.col-sm-6.col-md-4.mb-5').each(function (index, element) {
            var name = $(element).find('.search-card-content-title h3').text().trim();
            var year = $(element).find('.search-card-content-title span').first().text().trim();
            var location = $(element).find('.search-card-content-title span').last().text().trim();
            var description = $(element).find('.search-card-content-characteristics-row').text().trim();
            var price = $(element).find('.font-price').text().trim();
            var priceType = $(element).find('.search-card-content-pricing .badge-pro').text().trim();
            listings.push({
              name: name,
              year: year,
              location: location,
              description: description,
              price: price,
              priceType: priceType
            });
          });
          console.log(listings);
          _context27.next = 32;
          return regeneratorRuntime.awrap(sleep(200));

        case 32:
          _context27.next = 34;
          return regeneratorRuntime.awrap(browser.close());

        case 34:
        case "end":
          return _context27.stop();
      }
    }
  });
}

scrapeYachtWorld6(); //scrapeYachtWorld1()
//updateDatabase1();
//loopThroughList(l);
// Example usage

fetchAllProductUrls().then(function (urls) {//console.log('Product URLs:', urls);
  //loopThroughList(urls);
}); //updateDatabase();

app.listen(port, function () {
  console.log('Server is running on port: ' + port);
});