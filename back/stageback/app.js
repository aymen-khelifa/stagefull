var express = require('express')
var cors = require('cors')
var bodyParser = require('body-parser')
const mysql=require("mysql");
var port = process.env.PORT || 5000
var SequelizeStore = require("connect-session-sequelize");
var session =require( "express-session");
var flash =require("express-flash")
var app = express();

const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const axios = require('axios');
const dotenv =require("dotenv").config();
//fileUpload = require("express-fileupload"),
const Link =require("./models/sites");
const yacht =require("./models/yachts");
const request=require('request-promise');
const Sequelize = require('sequelize');
var multer = require('multer');
const path=require('path');
const cron = require('node-cron');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const storage=multer.diskStorage({
  destination:(req,file,cb)=>{
    cb(null,'images')
  },
  filename:(req,file,cb)=>{
    cb(null,Date.now()+path.extname(file.originalname))
  }
})
var upload = multer({ storage: storage })

app.use(session({ 
  secret: '123458cat',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 },
  secure: 'auto'
}))
const { exec } = require('child_process');
const ps = require('ps-node');

// enregistrer des message de la session 
app.set("view engine","ejs")
app.use(flash());

app.use(bodyParser.json())
app.use(cors({
  origin: 'http://localhost:3000', "preflightContinue":true, "optionsSuccessStatus":200, credentials:true
}));
app.use(
  bodyParser.urlencoded({
    extended: false
  })
)
app.use(bodyParser.urlencoded({ extended: false }));


app.use(function (req, res, next) {

  
  res.setHeader('Access-Control-Allow-Origin', "http://localhost:3000");
 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  res.setHeader('Access-Control-Allow-Headers', 'Authorization,X-Requested-With,content-type,Access-control-request-methods,access-control-allow-origin');

  res.header("X-Requested-With", "XMLHttpRequest");

  res.setHeader('Access-Control-Allow-Credentials', true);
 

 
 
  next();
})

app.options("http://localhost:3000", cors())
const FileUpload = require("express-fileupload");

app.use(FileUpload());
app.use(express.urlencoded({extended: true}))
app.use('/images', express.static('public/images'))
//requte f postman

var router =require('./routes/yacht')
app.use('/yachts', router);


var router =require('./routes/Users')
app.use('/users', router);

var router =require('./routes/sites')
app.use('/sites', router);


function getCountryFromUrl(url) {
  const domain = url.split('/')[2];
  const countryTLDs = {
      'fr': 'France',
      'de': 'Germany',
      'it': 'Italy',
      'es': 'Spain',
      'co.uk': 'United Kingdom',
      'com': 'International'
  };

  for (const [tld, country] of Object.entries(countryTLDs)) {
      if (domain.endsWith(tld)) {
          return country;
      }
  }

  return 'Unknown';
}

async function scrapeGoogle() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const searchQuery = 'voiliers des yachts à vendre';
  const url = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

  await page.goto(url);

  const content = await page.content();
  const $ = cheerio.load(content);

  const results = [];

  $('div.g').each((i, element) => {
      const name = $(element).find('h3').text();
      const description = $(element).find('.IsZvec').text();
      const link = $(element).find('a').attr('href');
      const imageUrl = $(element).find('img').attr('src');
      const price = $(element).find('.price').text().trim() || 
                      $(element).find('.a-price-whole').text().trim() ||
                      $(element).find('.a-price').text().trim() || 
                      $(element).find('.listingPrice').text().trim() || 
                      $(element).find('.blurb__price').text() 
                      
                      //'Non spécifié'
                      ;

      const userReviews = $(element).find('.reviews').text() || 'Non spécifié';
      const technicalDetails = $(element).find('.technical-details').text() || 'Non spécifié';
      const country = getCountryFromUrl(link);
      if (name && link) {
          results.push({
              name,
              description,
              technicalDetails,
              price,
              userReviews,
              imageUrl,
              productUrl: link,
              country
          });
      }
  });

  await browser.close();
  
  return results;
}

async function updateDatabase() {
  const results = await scrapeGoogle();
  
  for (const result of results) {
      const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl,country } = result;

      const existingEntry = await Link.findOne({ where: { productUrl } });
      const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      await delay(200);
    if (!existingEntry) {
     
    
      // Insérer un nouvel enregistrement
      await Link.upsert({
        name,
        description,
        technicalDetails,
        price,
        userReviews,
        imageUrl,
        productUrl,
        country,
     scrape:"{\"titre\":\"\",\"description\":\"\",\"technicalDetails\":\"\",\"price\":\"\",\"userReviews\":\"\",\"imageUrl\":\"\",\"productUrl\":\"\",\"country\":\"\",\"bloc\":\"\"}"});
    }
  }

  console.log('Données mises à jour dans la base de données');
}

// Configuration de la tâche cron pour exécuter le script tous les jours à 8h du matin
cron.schedule('0 8 * * *', () => {
  console.log('Tâche cron démarrée');
  updateDatabase1();
});
async function fetchAllProductUrls() {
 
    const yachtSales = await Link.findAll({ attributes: ['productUrl','scrape','restricted'],  
      where: {
      restricted :true
  } });

    const productUrls = yachtSales.map(yachtSale => yachtSale.productUrl);
     const scrapes = yachtSales.map(yachtSale => yachtSale.scrape);
    if (Array.isArray(yachtSales)) {
      const productUrls = yachtSales.map(yachtSale => yachtSale.productUrl);
      const scrapes = yachtSales.map(yachtSale => yachtSale.scrape);
     // console.log('Extracted product URLs:', productUrls);
     
      return {scrapes,productUrls};
    } //return scrapes; 
 
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}


  
const productUrls1 =  fetchAllProductUrls();
//https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale

async function scrapeYachtWorld1  ()  {
 // let item1="https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale";

 l=["https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale","https://www.ayc.fr/voilier-occasion"]
  l.forEach(async(item1, index) => { const browser = await puppeteer.launch({headless: true,});
  const page = await browser.newPage(); 
  await page.goto(item1);
     if (await page.$('img.captcha')) {
      const captchaSolution = await solveCaptcha(page);
      await page.type('input[name="captcha"]', captchaSolution);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    }
  
   //const z="$`aa`"
    // Wait for the CAPTCHA to be solved and the page to load
   const content = await page.content();
  let $ = cheerio.load(content);
  const listings = [];const boats = [];
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  console.log(item1);
  if(item1="https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale"){
    const yachtList = $('div.y-grid a.yp'); // Select all yacht listings
    console.log('Scraped Data2ddd');
    yachtList.each((index, element) => {
      const a="https://www.burgessyachts.com"
        const name = $(element).find('h2.yp__title').text().trim();
        const priceText = $(element).find('p.yp__sum span').text().trim();
        const priceMatch = priceText.match(/EUR\s([\d,]+)/); // Extract EUR and digits
        const price =$(element).find('.yp__sum span').text().trim();
        const detailsList = $(element).find('ul.yp__ms li.yp__msi');
        const productUrl = `${a}$(element).attr('href')`;
        let length = '', cabins = '', year = '', country = '';
        const imageUrla = $(element).find('.yp__visual img.yp__caro-img').attr('src');
       
        const construction = $(element).find('.yp__ms li:nth-child(3)').text().trim();
        detailsList.each((idx, el) => {
            const text = $(el).text().trim();
            if (text.includes('Longueur')) {
                length = text.replace('Longueur : ', '');
            } else if (text.includes('cabine(s)')) {
                cabins = text;
            } else if (text.includes('Chantier')) {
                year = text.split(',')[0].replace('Chantier ', '');
                country = text.split(', ').pop();
            }
        });
        const imageUrls = [];
    
      /*$('ul.glide__slides li.glide__slide picture img').each((index, element) => {
        const imgSrc = $(element).attr('src');
        if (imgSrc) {
          imageUrls.push(imgSrc);
        }
      });*/
      
      const imageUrl=`${a}${imageUrla}`;
        
        const description = `${length} ${cabins}`;
        const technicalDetails = `${length} ${cabins}`;
        console.log('Yacht Name:', name);
        console.log('Price:', price);
        console.log('Length:',`${a}${imageUrl}`);
        console.log('Cabins:', description);
       console.log('Year:', year);
        console.log('---',productUrl);
        console.log('---',country);
        console.log('---',imageUrls);
    const aa=""
        listings.push({ name, description,technicalDetails, price, aa,year,imageUrl,productUrl,country
        });console.log(listings)
    });
    const upsertResults = async (listings) => {
      for (const result of listings) {
          const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl, country } = result;
  
          await yacht.upsert({
              name,
              description,
              technicalDetails,
              price,
              userReviews,
              imageUrl,
              productUrl,
              country
          });
  
          // Introduce a delay between each upsert operation
          await delay(500); // 1000 milliseconds = 1 second
      }
  };upsertResults(listings).then(() => {
    console.log('Upsert operations completed.');
  });
    }
    else if(item1="https://www.ayc.fr/voilier-occasion"){
      console.log('Scraped Data1ddd');
       $('.bloc-bateau').each(async (index, element) => {
        const boat = {};const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      
        const a="https://www.ayc.fr";
  
        boat.imageUrl = $(element).find('.bloc-bateau-visuel a img').attr('src');
        boat.productUrl = `${"https://www.ayc.fr"}${$(element).find('.bloc-bateau-visuel a').attr('href')}`;
        boat.price = $(element).find('.bloc-bateau-prix a').text().trim();
        boat.name = $(element).find('.bloc-bateau-titre a').text().trim();
        boat.description = $(element).find('.bloc-bateau-accroche a').text().trim();
        boat.technicalDetails = $(element).find('.bloc-bateau-accroche a').text().trim();
        boat.country =getCountryFromUrl(item1);
        listings.push(boat); //await delay(4000);//console.log('Scraped Data1:', listings);
      })
      ;  const upsertResults = async (listings) => {
        for (const result of listings) {
            const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl, country } = result;
    
            await yacht.upsert({
                name,
                description,
                technicalDetails,
                price,
                userReviews,
                imageUrl,
                productUrl,
                country
            });
    
            // Introduce a delay between each upsert operation
            await delay(500); // 1000 milliseconds = 1 second
        }
    };upsertResults(listings).then(() => {
      console.log('Upsert operations completed.');
    });
    }
  
  //console.log(content)
   
  
  
  else if(item1="https://www.bandofboats.com/fr/bateaux-a-vendre/voiliers-luxe"){
    $('.col-12.col-sm-6.col-md-4.mb-5').each((index, element) => {
    const name = $(element).find('.search-card-content-title h3').text().trim();
    const year = $(element).find('.search-card-content-title span').first().text().trim();
    const location = $(element).find('.search-card-content-title span').last().text().trim();
    const description = $(element).find('.search-card-content-characteristics-row').text().trim();
    const price = $(element).find('.font-price').text().trim();
    const priceType = $(element).find('.search-card-content-pricing .badge-pro').text().trim();
  
    listings.push({
        name,
        year,
        location,
        description,
        price,
        priceType
    });
  
  }); console.log(listings)
  const upsertResults = async (listings) => {
    for (const result of listings) {
        const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl, country } = result;

        await yacht.upsert({
            name,
            description,
            technicalDetails,
            price,
            userReviews,
            imageUrl,
            productUrl,
            country
        });

        // Introduce a delay between each upsert operation
        await delay(500); // 1000 milliseconds = 1 second
    }
};upsertResults(listings).then(() => {
  console.log('Upsert operations completed.');
});
  }
  
  
  else{console.log('Scraped Data1:');}
  await sleep(3000);
  console.log('Scraped Data1dd:',listings);
  await browser.close();
    // Perform an action with each item
   //scrapeYachtWorld1(item)
   })
  
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

}

const scrapeYachtWorld2 = async () => {
  // let item1="https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale";
  
   const browser = await puppeteer.launch({headless: true,});
   const page = await browser.newPage(); 
   //await page.goto(item1, { timeout: 120000 });
      if (await page.$('img.captcha')) {
       const captchaSolution = await solveCaptcha(page);
       await page.type('input[name="captcha"]', captchaSolution);
       await page.click('button[type="submit"]');
       await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
     }
   
    //const z="$`aa`"
     // Wait for the CAPTCHA to be solved and the page to load
  //  const content = await page.content();
  // let $ = cheerio.load(content);
   const listings = [];const boats = [];
   const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
 
    let item1="https://www.ayc.fr/voilier-occasion";
    await page.goto(item1/*, { timeout: 120000 }*/);
      if (await page.$('img.captcha')) {
       const captchaSolution = await solveCaptcha(page);
       await page.type('input[name="captcha"]', captchaSolution);
       await page.click('button[type="submit"]');
       await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
     }
     const content = await page.content();
     let $ = cheerio.load(content);
   
     console.log('Scraped Data1ddd');
      $('.bloc-bateau').each(async (index, element) => {
       const boat = {};const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
     
       const a="https://www.ayc.fr";
 
       boat.imageUrl = $(element).find('.bloc-bateau-visuel a img').attr('src');
       boat.productUrl = `${"https://www.ayc.fr"}${$(element).find('.bloc-bateau-visuel a').attr('href')}`;
       boat.price = $(element).find('.bloc-bateau-prix a').text().trim();
       boat.name = $(element).find('.bloc-bateau-titre a').text().trim();
       boat.description = $(element).find('.bloc-bateau-accroche a').text().trim();
       boat.technicalDetails = $(element).find('.bloc-bateau-accroche a').text().trim();
       boat.country =getCountryFromUrl(item1);
       listings.push(boat);// await delay(4000);//console.log('Scraped Data1:', listings);
     })
     ;
   
 
 //console.log(content)
let item2="https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale"
await page.goto(item2, { timeout: 120000 });
      if (await page.$('img.captcha')) {
       const captchaSolution = await solveCaptcha(page);
       await page.type('input[name="captcha"]', captchaSolution);
       await page.click('button[type="submit"]');
       await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
     }
     const content1 = await page.content();
   let $1 = cheerio.load(content1);
 const yachtList = $('div.y-grid a.yp'); // Select all yacht listings
 console.log("content")
 yachtList.each((index, element) => {
  
     const name = $1(element).find('h2.yp__title').text().trim();
     const priceText = $1(element).find('p.yp__sum span').text().trim();
     const priceMatch = priceText.match(/EUR\s([\d,]+)/); // Extract EUR and digits
     const price =$1(element).find('.yp__sum span').text().trim();
     const detailsList = $1(element).find('ul.yp__ms li.yp__msi');
     const link = $1(element).attr('href');
     let length = '', cabins = '', year = '', location = '';
     const imageUrl = $1(element).find('.yp__visual img.yp__caro-img').attr('src');
    
     const construction = $1(element).find('.yp__ms li:nth-child(3)').text().trim();
     detailsList.each((idx, el) => {
         const text = $1(el).text().trim();
         if (text.includes('Longueur')) {
             length = text.replace('Longueur : ', '');
         } else if (text.includes('cabine(s)')) {
             cabins = text;
         } else if (text.includes('Chantier')) {
             year = text.split(',')[0].replace('Chantier ', '');
              location = text.split(', ').pop();
         }
     });
     const imageUrls = [];
 
   /*$('ul.glide__slides li.glide__slide picture img').each((index, element) => {
     const imgSrc = $(element).attr('src');
     if (imgSrc) {
       imageUrls.push(imgSrc);
     }
   });*/
   const r=`${a}${imageUrl}`;
     const a="https://www.burgessyachts.com"
     const description = `${length} ${cabins}`;
     console.log('Yacht Name:', yachtName);
     console.log('Price:', price);
     console.log('Length:',`${a}${imageUrl}`);
     console.log('Cabins:', lengthAndCabins);
    console.log('Year:', year);
     console.log('---',link);
     console.log('---',location);
     console.log('---',imageUrls);
 const aa=""
     listings.push({ name, price, description,detailsList, aa,year,r,link,country
     });
 });
 
 console.log(listings)
 
 item1="https://www.bandofboats.com/fr/bateaux-a-vendre/voiliers-luxe"
 await page.goto(item1, { timeout: 120000 });
      if (await page.$('img.captcha')) {
       const captchaSolution = await solveCaptcha(page);
       await page.type('input[name="captcha"]', captchaSolution);
       await page.click('button[type="submit"]');
       await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
     }
   
   $('.col-12.col-sm-6.col-md-4.mb-5').each((index, element) => {
   const name = $(element).find('.search-card-content-title h3').text().trim();
   const year = $(element).find('.search-card-content-title span').first().text().trim();
   const location = $(element).find('.search-card-content-title span').last().text().trim();
   const description = $(element).find('.search-card-content-characteristics-row').text().trim();
   const price = $(element).find('.font-price').text().trim();
   const priceType = $(element).find('.search-card-content-pricing .badge-pro').text().trim();
 
   listings.push({
       name,
       year,
       location,
       description,
       price,
       priceType
   });
 
 });console.log('Scraped Data1:',listings);//return listings
 
 
 
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
 
 
 
 await sleep(3000);
 
   await browser.close();//return results;
   //return boats;
 return listings;
 
 }


 async function scrapeYachtWorld3  ()  {
   let item1="https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale";
 
  l=["https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale","https://www.ayc.fr/voilier-occasion"]
   l.forEach(async(item1, index) => { const browser = await puppeteer.launch({headless: true,});
   const page = await browser.newPage(); 
   await page.goto(item1);
      if (await page.$('img.captcha')) {
       const captchaSolution = await solveCaptcha(page);
       await page.type('input[name="captcha"]', captchaSolution);
       await page.click('button[type="submit"]');
       await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
     }
   
    //const z="$`aa`"
     // Wait for the CAPTCHA to be solved and the page to load
    const content = await page.content();
   let $ = cheerio.load(content);
   const listings = [];const boats = [];
   const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
   console.log(item1);
   if(item1="https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale"){
     const yachtList = $('div.y-grid a.yp'); // Select all yacht listings
     console.log('Scraped Data2ddd');
     yachtList.each((index, element) => {
         const name = $(element).find('h2.yp__title').text().trim();
         const priceText = $(element).find('p.yp__sum span').text().trim();
         const priceMatch = priceText.match(/EUR\s([\d,]+)/); // Extract EUR and digits
         const price =$(element).find('.yp__sum span').text().trim();
         const detailsList = $(element).find('ul.yp__ms li.yp__msi');
         const productUrl = $(element).attr('href');
         let length = '', cabins = '', year = '', country = '';
         const imageUrla = $(element).find('.yp__visual img.yp__caro-img').attr('src');
        
         const construction = $(element).find('.yp__ms li:nth-child(3)').text().trim();
         detailsList.each((idx, el) => {
             const text = $(el).text().trim();
             if (text.includes('Longueur')) {
                 length = text.replace('Longueur : ', '');
             } else if (text.includes('cabine(s)')) {
                 cabins = text;
             } else if (text.includes('Chantier')) {
                 year = text.split(',')[0].replace('Chantier ', '');
                 country = text.split(', ').pop();
             }
         });
         const imageUrls = [];
     
       /*$('ul.glide__slides li.glide__slide picture img').each((index, element) => {
         const imgSrc = $(element).attr('src');
         if (imgSrc) {
           imageUrls.push(imgSrc);
         }
       });*/
       const a="https://www.burgessyachts.com"
       const imageUrl=`${a}${imageUrla}`;
         
         const description = `${length} ${cabins}`;
         const technicalDetails = `${length} ${cabins}`;
         console.log('Yacht Name:', name);
         console.log('Price:', price);
         console.log('Length:',`${a}${imageUrl}`);
         console.log('Cabins:', description);
        console.log('Year:', year);
         console.log('---',productUrl);
         console.log('---',country);
         console.log('---',imageUrls);
     const aa=""
         listings.push({ name, description,technicalDetails, price, aa,year,imageUrl,productUrl,country
         });console.log(listings)
     });
     const upsertResults = async (listings) => {
       for (const result of listings) {
           const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl, country } = result;
   
           await yacht.Create({
               name:name,
               description,
               technicalDetails,
               price,
               userReviews,
               imageUrl,
               productUrl,
               country
           });
   
           // Introduce a delay between each upsert operation
           await delay(500); // 1000 milliseconds = 1 second
       }
   };upsertResults(listings).then(() => {
     console.log('Upsert operations completed.');
   });
     }
     else if(item1="https://www.ayc.fr/voilier-occasion"){
       console.log('Scraped Data1ddd');
        $('.bloc-bateau').each(async (index, element) => {
         const boat = {};const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
       
         const a="https://www.ayc.fr";
   
         boat.imageUrl = $(element).find('.bloc-bateau-visuel a img').attr('src');
         boat.productUrl = `${"https://www.ayc.fr"}${$(element).find('.bloc-bateau-visuel a').attr('href')}`;
         boat.price = $(element).find('.bloc-bateau-prix a').text().trim();
         boat.name = $(element).find('.bloc-bateau-titre a').text().trim();
         boat.description = $(element).find('.bloc-bateau-accroche a').text().trim();
         boat.technicalDetails = $(element).find('.bloc-bateau-accroche a').text().trim();
         boat.country =getCountryFromUrl(item1);
         listings.push(boat); //await delay(4000);//console.log('Scraped Data1:', listings);
       })
       ;  const upsertResults = async (listings) => {
         for (const result of listings) {
             const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl, country } = result;
     
             await yacht.upsert({
                 name,
                 description,
                 technicalDetails,
                 price,
                 userReviews,
                 imageUrl,
                 productUrl,
                 country
             });
     
             // Introduce a delay between each upsert operation
             await delay(500); // 1000 milliseconds = 1 second
         }
     };upsertResults(listings).then(() => {
       console.log('Upsert operations completed.');
     });
     }
   
   //console.log(content)
    
   
   
   else if(item1="https://www.bandofboats.com/fr/bateaux-a-vendre/voiliers-luxe"){
     $('.col-12.col-sm-6.col-md-4.mb-5').each((index, element) => {
     const name = $(element).find('.search-card-content-title h3').text().trim();
     const year = $(element).find('.search-card-content-title span').first().text().trim();
     const location = $(element).find('.search-card-content-title span').last().text().trim();
     const description = $(element).find('.search-card-content-characteristics-row').text().trim();
     const price = $(element).find('.font-price').text().trim();
     const priceType = $(element).find('.search-card-content-pricing .badge-pro').text().trim();
   
     listings.push({
         name,
         year,
         location,
         description,
         price,
         priceType
     });
   
   }); console.log(listings)
   const upsertResults = async (listings) => {
     for (const result of listings) {
         const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl, country } = result;
 
         await yacht.upsert({
             name,
             description,
             technicalDetails,
             price,
             userReviews,
             imageUrl,
             productUrl,
             country
         });
 
         // Introduce a delay between each upsert operation
         await delay(500); // 1000 milliseconds = 1 second
     }
 };upsertResults(listings).then(() => {
   console.log('Upsert operations completed.');
 });
   }
   
   
   else{console.log('Scraped Data1:');}
   await sleep(3000);
   console.log('Scraped Data1dd:',listings);
   await browser.close();
     // Perform an action with each item
    //scrapeYachtWorld1(item)
    })
   
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
 
 }
 
async function updateDatabase2() {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  

  const results = await scrapeYachtWorld1();
  console.log('ee',results);
  const upsertResults = async (results) => {
    for (const result of results) {
        const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl, country } = result;

        await yacht.upsert({
            name,
            description,
            technicalDetails,
            price,
            userReviews,
            imageUrl,
            productUrl,
            country
        });

        // Introduce a delay between each upsert operation
        await delay(500); // 1000 milliseconds = 1 second
    }
};upsertResults(results).then(() => {
  console.log('Upsert operations completed.');
});

  //console.log('Données mises à jour dans la base de données');
}
//scrapeYachtWorld2()   


async function updateDatabase1() {
 
  const results = await scrapeYachtWorld1();
  console.log('ee',results);
  const upsertResults = async (results) => {
    for (const result of results) {
        const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl, country } = result;

        await yacht.upsert({
            name,
            description,
            technicalDetails,
            price,
            userReviews,
            imageUrl,
            productUrl,
            country
        });

        // Introduce a delay between each upsert operation
        await delay(500); // 1000 milliseconds = 1 second
    }
};upsertResults(results).then(() => {
  console.log('Upsert operations completed.');
});

  //console.log('Données mises à jour dans la base de données');
}
async function scrapeYachtWorld4 ()  {
   let item1="https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale";
 
  
    const browser = await puppeteer.launch({headless: true,});
   const page = await browser.newPage(); 
   await page.goto(item1);
      if (await page.$('img.captcha')) {
       const captchaSolution = await solveCaptcha(page);
       await page.type('input[name="captcha"]', captchaSolution);
       await page.click('button[type="submit"]');
       await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
     }
   
   
    const content = await page.content();
   let $ = cheerio.load(content);
   const listings = [];const boats = [];
   const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
   
   
     const yachtList = $('div.y-grid a.yp'); // Select all yacht listings
   
     yachtList.each((index, element) => { const a="https://www.burgessyachts.com";
         const name = $(element).find('h2.yp__title').text().trim();
         const priceText = $(element).find('p.yp__sum span').text().trim();
         const priceMatch = priceText.match(/EUR\s([\d,]+)/); // Extract EUR and digits
         const price =$(element).find('.yp__sum span').text().trim();
         const detailsList = $(element).find('ul.yp__ms li.yp__msi');
         const productUrl1 = $(element).attr('href');
         let length = '', cabins = '', year = '', country = '';
         const imageUrla = $(element).find('.yp__visual img.yp__caro-img').attr('src');
         const productUrl = `${a}${$(element).attr('href')}`;
         const construction = $(element).find('.yp__ms li:nth-child(3)').text().trim();
         detailsList.each((idx, el) => {
             const text = $(el).text().trim();
             if (text.includes('Longueur')) {
                 length = text.replace('Longueur : ', '');
             } else if (text.includes('cabine(s)')) {
                 cabins = text;
             } else if (text.includes('Chantier')) {
                 year = text.split(',')[0].replace('Chantier ', '');
                 country = text.split(', ').pop();
             }
         });
         const imageUrls = [];
    
      
       const imageUrl=`${a}${imageUrla}`;
         
         const description = `${length} ${cabins}`;
         const technicalDetails = `${length} ${cabins}`;
        
     const aa=""
         listings.push({ name, description,technicalDetails, price, aa,imageUrl,productUrl,country
         });console.log(listings)
     });
     const upsertResults = async (listings) => {
       for (const result of listings) {
           const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl, country } = result;
   
           await yacht.upsert({
               name,
               description,
               technicalDetails,
               price,
               userReviews,
               imageUrl,
               productUrl,
               country
           });
   
           // Introduce a delay between each upsert operation
           await delay(200); // 1000 milliseconds = 1 second
       }
   };upsertResults(listings).then(() => {
     console.log('Upsert operations completed.');
   });
     
     
   await sleep(3000);
   //console.log('Scraped Data1dd:',listings);
   await browser.close();
    
  
   

 
 }

 async function scrapeYachtWorld5  ()  {
  let item1="https://www.ayc.fr/voilier-occasion"
 const browser = await puppeteer.launch({headless: true,});
  const page = await browser.newPage(); 
  await page.goto(item1);
     if (await page.$('img.captcha')) {
      const captchaSolution = await solveCaptcha(page);
      await page.type('input[name="captcha"]', captchaSolution);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    }
  
  
   const content = await page.content();
  let $ = cheerio.load(content);
  const listings = [];const boats = [];
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  

       $('.bloc-bateau').each(async (index, element) => {
        const boat = {};const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
      
    
  
        boat.imageUrl = $(element).find('.bloc-bateau-visuel a img').attr('src');
        boat.productUrl = `${"https://www.ayc.fr"}${$(element).find('.bloc-bateau-visuel a').attr('href')}`;
        boat.price = $(element).find('.bloc-bateau-prix a').text().trim();
        boat.name = $(element).find('.bloc-bateau-titre a').text().trim();
        boat.description = $(element).find('.bloc-bateau-accroche a').text().trim();
        boat.technicalDetails = $(element).find('.bloc-bateau-accroche a').text().trim();
        boat.country =getCountryFromUrl(item1);
        listings.push(boat); //await delay(500);//console.log('Scraped Data1:', listings);
      })
      ;  const upsertResults = async (listings) => {
        for (const result of listings) {
            const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl, country } = result;
    
            await yacht.upsert({
                name,
                description,
                technicalDetails,
                price,
                userReviews,
                imageUrl,
                productUrl,
                country
            });
    
            // Introduce a delay between each upsert operation
            await delay(300); // 1000 milliseconds = 1 second
        }
    };upsertResults(listings).then(() => {
      console.log('Upsert operations completed.');
    });
    
  
 

}

async function scrapeYachtWorld6 ()  {
  
item1="https://www.bandofboats.com/fr/bateaux-a-vendre/voiliers-luxe"
 
   const browser = await puppeteer.launch({headless: true,});
  const page = await browser.newPage(); 
  await page.goto(item1);
     if (await page.$('img.captcha')) {
      const captchaSolution = await solveCaptcha(page);
      await page.type('input[name="captcha"]', captchaSolution);
      await page.click('button[type="submit"]');
      await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
    }
  
  
   const content = await page.content();
  let $ = cheerio.load(content);
  const listings = [];const boats = [];
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  $('.search-card-result').each((index, element) => {
    const name = $(element).find('.search-card-content-title h3').text().trim();
    const year = $(element).find('.search-card-content-title span:nth-child(1)').text().trim();
    const occasion = $(element).find('.search-card-content-title span:nth-child(2)').text().trim();
    const location = $(element).find('.search-card-content-title .bi-geo-alt + span').text().trim();
    const length = $(element).find('.search-card-content-characteristics-row:nth-child(1)').text().split(' : ')[1]?.trim();
    const width = $(element).find('.search-card-content-characteristics-row:nth-child(1) span + span').text().split(' : ')[1]?.trim();
    const keel = $(element).find('.search-card-content-characteristics-desktop span:nth-child(1)').text().split(' : ')[1]?.trim();
    const material = $(element).find('.search-card-content-characteristics-desktop span:nth-child(2)').text().split(' : ')[1]?.trim();
    const cabins = $(element).find('.search-card-content-characteristics-desktop span:nth-child(3)').text().split(' : ')[1]?.trim();
    const price = $(element).find('.search-card-content-pricing .font-price').text().trim();
    const owner = $(element).find('.search-card-content-owner .font-user').text().trim();
    const imageUrl = $(element).find('.search-card-img img').attr('src');
    const link = $(element).find('a').attr('href');
    const location1 = $(element).find('.d-block.text-steelblue.text-truncate').text().trim();
    const characteristics = $(element).find('.search-card-content-characteristics-row').map((index, el) => {
      return $(el).text().trim().replace(/\s+/g, ' ');
  }).get().join(' ');

 
 // console.log(characteristics)
    listings.push({
        name,
        year,
        occasion,
        location,
        length,
        width,
        keel,
        material,
        cabins,
        price,
        owner,
        imageUrl,
    });console.log(listings)
});

  
  $('div.row col-12.col-sm-6.col-md-4.mb-5').each((index, element) => {
  const name = $(element).find('.search-card-content-title h3').text().trim();
  const year = $(element).find('.search-card-content-title span').first().text().trim();
  const location = $(element).find('.search-card-content-title span').last().text().trim();
  const description = $(element).find('.search-card-content-characteristics-row').text().trim();
  const price = $(element).find('.font-price').text().trim();
  const priceType = $(element).find('.search-card-content-pricing .badge-pro').text().trim();

  listings.push({
      name,
      year,
      location,
      description,
      price,
      priceType
  });

}); //console.log(listings)
    
    
  await sleep(200);
 
  await browser.close();
   
 
  


}

 //scrapeYachtWorld4()
// scrapeYachtWorld5()
// scrapeYachtWorld6()
function loopThroughList(list) {
  
  

  // Check if the input is an array
  if (Array.isArray(list)) {
    list.forEach(async(item, index) => {
      // Perform an action with each item
     // scrapeYachtWorld1(item)
     const browser = await puppeteer.launch({headless: true,});
     const page = await browser.newPage(); 
     await page.goto(item);
        if (await page.$('img.captcha')) {
         const captchaSolution = await solveCaptcha(page);
         await page.type('input[name="captcha"]', captchaSolution);
         await page.click('button[type="submit"]');
         await page.waitForNavigation({ waitUntil: 'domcontentloaded' });
       }
     
      //const z="$`aa`"
       // Wait for the CAPTCHA to be solved and the page to load
      const content = await page.content();
     let $ = cheerio.load(content);
     const listings = [];const boats = [];
     const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
     response = await Link.findAll({
      attributes:['uuid','scrape'],
     
      
  }); console.log(response)
    /* if(item="https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale"){
       const yachtList = $('div.y-grid a.yp'); // Select all yacht listings
      
       yachtList.each((index, element) => {const a="https://www.burgessyachts.com"
           const name = $(element).find('h2.yp__title').text().trim();
           const priceText = $(element).find('p.yp__sum span').text().trim();
           const priceMatch = priceText.match(/EUR\s([\d,]+)/); // Extract EUR and digits
           const price =$(element).find('.yp__sum span').text().trim();
           const detailsList = $(element).find('ul.yp__ms li.yp__msi');
           const productUrl = `${a}${$(element).attr('href')}`;
           let length = '', cabins = '', year = '', country = '';
           const imageUrla = $(element).find('.yp__visual img.yp__caro-img').attr('src');
          
           const construction = $(element).find('.yp__ms li:nth-child(3)').text().trim();
           detailsList.each((idx, el) => {
               const text = $(el).text().trim();
               if (text.includes('Longueur')) {
                   length = text.replace('Longueur : ', '');
               } else if (text.includes('cabine(s)')) {
                   cabins = text;
               } else if (text.includes('Chantier')) {
                   year = text.split(',')[0].replace('Chantier ', '');
                   country = text.split(', ').pop();
               }
           });
           const imageUrls = [];
       
         /*$('ul.glide__slides li.glide__slide picture img').each((index, element) => {
           const imgSrc = $(element).attr('src');
           if (imgSrc) {
             imageUrls.push(imgSrc);
           }
         });*/
         
      /*   const imageUrl=`${a}${imageUrla}`;
           
           const description = `${length} ${cabins}`;
           const technicalDetails = `${length} ${cabins}`;
           console.log('Yacht Name:', name);
           console.log('Price:', price);
           console.log('Length:',`${a}${imageUrl}`);
           console.log('Cabins:', description);
          console.log('Year:', year);
           console.log('---',productUrl);
           console.log('---',country);
           console.log('---',imageUrls);
       const aa=""
           listings.push({ name, description,technicalDetails, price, aa,year,imageUrl,productUrl,country
           });console.log(listings)
       });
       const upsertResults = async (listings) => {
         for (const result of listings) {
             const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl, country } = result;
     
             await yacht.upsert({
                 name,
                 description,
                 technicalDetails,
                 price,
                 userReviews,
                 imageUrl,
                 productUrl,
                 country
             });
     
             // Introduce a delay between each upsert operation
             await delay(500); // 1000 milliseconds = 1 second
         }
     };upsertResults(listings).then(() => {
       console.log('Upsert operations completed.');
     });
       }*/
     /*  if(item="https://www.ayc.fr/voilier-occasion"){
         console.log('Scraped Data1ddd');
          $('.bloc-bateau').each(async (index, element) => {
           const boat = {};const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
         
           const a="https://www.ayc.fr";
     
           boat.imageUrl = $(element).find('.bloc-bateau-visuel a img').attr('src');
           boat.productUrl = `${"https://www.ayc.fr"}${$(element).find('.bloc-bateau-visuel a').attr('href')}`;
           boat.price = $(element).find('.bloc-bateau-prix a').text().trim();
           boat.name = $(element).find('.bloc-bateau-titre a').text().trim();
           boat.description = $(element).find('.bloc-bateau-accroche a').text().trim();
           boat.technicalDetails = $(element).find('.bloc-bateau-accroche a').text().trim();
           boat.country =getCountryFromUrl(item);
           listings.push(boat); //await delay(4000);//console.log('Scraped Data1:', listings);
         })
         ;  const upsertResults = async (listings) => {
           for (const result of listings) {
               const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl, country } = result;
       
               await yacht.upsert({
                   name,
                   description,
                   technicalDetails,
                   price,
                   userReviews,
                   imageUrl,
                   productUrl,
                   country
               });
       
               // Introduce a delay between each upsert operation
               await delay(500); // 1000 milliseconds = 1 second
           }
       };upsertResults(listings).then(() => {
         console.log('Upsert operations completed.');
       });
       }*/
 
  /*    if(item="https://www.bandofboats.com/fr/bateaux-a-vendre/voiliers-luxe"){
       $('.col-12.col-sm-6.col-md-4.mb-5').each((index, element) => {
       const name = $(element).find('.search-card-content-title h3').text().trim();
       const year = $(element).find('.search-card-content-title span').first().text().trim();
       const location = $(element).find('.search-card-content-title span').last().text().trim();
       const description = $(element).find('.search-card-content-characteristics-row').text().trim();
       const price = $(element).find('.font-price').text().trim();
       const priceType = $(element).find('.search-card-content-pricing .badge-pro').text().trim();
     
       listings.push({
           name,
           year,
           location,
           description,
           price,
           priceType
       });
     
     }); console.log(listings)
     const upsertResults = async (listings) => {
       for (const result of listings) {
           const { name, description, technicalDetails, price, userReviews, imageUrl, productUrl, country } = result;
   
           await yacht.upsert({
               name,
               description,
               technicalDetails,
               price,
               userReviews,
               imageUrl,
               productUrl,
               country
           });
   
           // Introduce a delay between each upsert operation
           await delay(500); // 1000 milliseconds = 1 second
       }
   };upsertResults(listings).then(() => {
     console.log('Upsert operations completed.');
   });
     }
    */
     
   //  else{console.log('Scraped Data1:');}
     //await sleep(3000);
     console.log('Scraped Data1dd:',listings);
     await browser.close();
      // Example condition-based actions
      if (typeof item === 'string') {
       // console.log(`String item: ${item.toUpperCase()}`);
        
function getCountryFromUrl1(item) {
    const domain = item.split('/')[2];
    const countryTLDs = {
        'fr': 'France',
        'de': 'Germany',
        'it': 'Italy',
        'es': 'Spain',
        'co.uk': 'United Kingdom',
        'com': 'International'
    };

    for (const [tld, country] of Object.entries(countryTLDs)) {
        if (domain.endsWith(tld)) {
            return country;
        }
    }

    return 'Unknown';
}

      

      } else if (typeof item === 'number') {
        console.log(`Number item: ${item * 2}`);
      } else {
        console.log(`Other type: ${item}`);
      }
    });
  } else {
    console.error('The provided input is not an array.');
  }
}
function extractNameAndEmail(jsonString) {
  try {
    const jsonObject = JSON.parse(jsonString);
   
    const titre = jsonObject.titre;
    const description = jsonObject.description;
    const technicalDetails = jsonObject.technicalDetails;
    const price = jsonObject.price;
    const userReviews = jsonObject.userReviews;
    const imageUrl = jsonObject.imageUrl;
    const productUrl = jsonObject.productUrl;
    const country = jsonObject.country;
    const bloc = jsonObject.bloc;
    console.log(titre, description,technicalDetails,price,userReviews,imageUrl,productUrl,country,bloc);
    return { titre, description,technicalDetails,price,userReviews,imageUrl,productUrl,country,bloc };
  } catch (error) {
    console.error("Error parsing JSON string:", error);
    return null;
  }
}



async function fetchAndLogLinks() {
  try {
    const response = await Link.findOne({
      attributes: ['uuid', 'scrape'],
    }); if (response) {
      const scrapeData = JSON.parse(response.dataValues.scrape);
      console.log(scrapeData);
      const { name, email } = extractNameAndEmail(scrapeData);
      console.log(name);console.log(email);
 
   /*   const name = $(element).find(`name1`).text().trim();
      const userReviews = $(element).find('p.yp__sum span').text().trim();
      const technicalDetails = priceText.match(/EUR\s([\d,]+)/); // Extract EUR and digits
      const price =$(element).find('.yp__sum span').text().trim();
      const description = $(element).find('ul.yp__ms li.yp__msi');
      const productUrl = `${a}${$(element).attr('href')}`;
      const imageUrl = $(element).find('.yp__visual img.yp__caro-img').attr('src');
      //console.log(name)*/
    } else {
      console.log('No record found');
    }
  } catch (error) {
    console.error('Error fetching links:', error);
  }
}

//fetchAndLogLinks();

//scrapeYachtWorld5()
//updateDatabase1();
l=["https://www.burgessyachts.com/fr/buy-a-yacht/yachts-for-sale/sailing-yachts-for-sale","https://www.ayc.fr/voilier-occasion"]
//loopThroughList(list);

/*fetchAllProductUrls().then(urls => {
  console.log('Product URLs:', urls);
 //loopThroughList(urls);
 
 urls.forEach(url => {
 
 // extractNameAndEmail(url);
 
  const jsonObject = JSON.parse(url);
  const name = jsonObject.name;
  const email = jsonObject.email;
 // console.log(jsonObject.name, email);
  extractNameAndEmail(jsonObject);
 
});
});*/

async function processScrapes() {
  const { scrapes, productUrls } = await fetchAllProductUrls();
  for (const [index, scrape] of scrapes.entries()) {
    try {
      const jsonObject = JSON.parse(scrape);
      const {titre, description,technicalDetails,price,userReviews,imageUrl,productUrl,country,bloc } = extractNameAndEmail(jsonObject);
      const productUrl1 = productUrls[index];
      
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(productUrl1);  // Assuming you want to visit the product URL
      const content = await page.content();
     // console.log('Product URL:', content);
      const $ = cheerio.load(content);
      console.log('Extracted Name:', titre);
      console.log('Extracted Email:', description);
      console.log('Product URL:', productUrl1);
      console.log('Product URL:', bloc);
      const results = [];
      $(`${bloc}`).each((i, element) => {//
        const name = $(element).find(`${titre}`).text().trim();
        const description1 = $(element).find(`${description}`).text().trim();
        const link1 = $(element).find(`${productUrl}`).attr('href');
        const imageUrl1 = $(element).find(`${imageUrl}`).attr('src')|| 'Non spécifié';
        const price1 = $(element).find(`${price}`).text().trim()|| 'Non spécifié' ;
        console.log('Product URL:', name);
                
  
        const userReviews1 = $(element).find(`${userReviews}`).text().trim() || 'Non spécifié';
        const technicalDetails1 = $(element).find(`${technicalDetails}`).text().trim() || 'Non spécifié';
        const country1 = $(element).find(`${country}`).text() || getCountryFromUrl(productUrl1);
        if (name && link1) {
            results.push({
              name,
                description1,
                technicalDetails1,
                price1,
                userReviews1,
                imageUrl1,
                productUrl1: link1,
                country1
            });
        }
    });
   // console.log('Product URL:', results);
    await browser.close();
   /* const upsertResults = async (results) => {
      for (const result of results) {
          const { name, description1, technicalDetails1, price1, userReviews1, imageUrl1, productUrl1, country1 } = result;
  
          await yacht.upsert({
            name:name,
            description:description1,
            technicalDetails:technicalDetails1,
            price:price1,
            userReviews:userReviews1,
            imageUrl:imageUrl1,
            productUrl: productUrl1,
            country:country1
          });
  
         
         // await delay(500); 
      }
  };upsertResults(results).then(() => {
    console.log('Upsert operations completed.');
  });*/
  //  return results;
    } catch (error) {
      console.log('Error parsing JSON:', scrape, error);
    }
  }
}


//processScrapes()
//updateDatabase();

 app.listen(port, function() {

  
  console.log('Server is running on por: ' + port)
})