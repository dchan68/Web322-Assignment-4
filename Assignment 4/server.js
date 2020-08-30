/*********************************************************************************
*  WEB322 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students. 
*
*Name: Daryan Chan Student ID: 113973182 Date: 3/4/2020
*
*Online (Heroku) Link: https://vast-journey-17242.herokuapp.com/
*
********************************************************************************/ 

var path = require("path");

//assignment 3 requirement
var multer = require("multer");

//asignment 4 requirement
var exphbs = require('express-handlebars');

//basically like header file for C++. required to connect to data-service.js module 
//so that code from that file can be used be used here
var dataService = require('./data-service')

//allows us to use get. ex app.get in line 36
var express = require("express");
var app = express();

//assignment 4 part 1 code
app.engine('.hbs', exphbs({ 
  extname: '.hbs',
  defaultLayout: "main",
  helpers: {    
    navLink: function(url, options){
      return '<li ' + 
        ((url == app.locals.activeRoute)? 'class="active" ' : '') +
        '><a href="'+ url + '">' + options.fn(this) + '</a></li>';
    }
  }
 }));
app.set('view engine', '.hbs');


//assignment 3 part 2
const storage = multer.diskStorage({
  destination: "./public/pictures/uploaded",
  filename: function (req, file, cb){
    cb(null, Date.now() + path.extname(file.originalname));   //check the notes for correct usage
  }
});

const upload = multer({ storage: storage }); //assignment 3 part 2 ends here

//This code is basically to connect to heroku
var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

//assignment 4 (adding middleware) This will fix menu highlighting issue
app.use(function(req, res, next){
  let route = req.baseUrl + req.path;
  app.locals.activeRoute = (route =="/")?"/" : route.replace(/\/$/,"");
  next();
});


//note to self: app.use(express.static('public')) will be explained week 4
app.use(express.static('public')); 
// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function(req,res){
  res.render("home");
});

//assignment 4, changing to render about page
app.get("/about", function(req,res){
  res.render("about", {
    layout: "main"
  })
});

//If the /people is requested, this function will be called. dataService refers back to data-service.js module
//and utilize the getAllPeople() function from data-service.js module
app.get("/people", function(req,res){

  //assignment 3, part 4 updating /people route
  if (req.query.vin){
    dataService.getPeopleByVin(req.query.vin) //query is used if user enters /people?vin=value
    .then((data)=>{
      res.render("people", {people: data})
    })
    .catch(err=>{
      res.render({message: "no results"})
    })
  }
  else{
    dataService.getAllPeople()
    .then((data)=>{
      res.render("people", {people: data})
    })
    .catch(err=>{
      res.render({message: "no results"})
    })
  }
});


 
//If the /cars is requested, this function will be called. dataService refers back to data-service.js module
//and utilize the getCars() function from data-service.js module
app.get("/cars", function(req,res){
  if (req.query.vin){  //query used for if user enters /cars?vin=value, where value is equal to a certain vin
    dataService.getCarsByVin(req.query.vin)
    .then((data)=>{
      res.render("cars", {cars: data});
    })
    .catch(err=>{
      res.json(err);
    })
  }
  else if (req.query.make){
    dataService.getCarsByMake(req.query.make)
    .then((data)=>{
      res.render("cars", {cars: data});
    })
    .catch(err=>{
      res.json(err);
    })
  }
  else if (req.query.year){
    dataService.getCarsByYear(req.query.year)
    .then((data)=>{
      res.render("cars", {cars: data});
    })
    .catch(err=>{
      res.json(err);
    })
  }
  else{
    dataService.getCars()
    .then((data)=>{
      res.render("cars", {cars: data});
    })
    .catch(err=>{
      res.json(err);
    })
  }
});

//If the /stores is requested, this function will be called. dataService refers back to data-service.js module
//and utilize the getStores() function from data-service.js module
//app.get("/stores", function(req,res){
//  dataService.getStores()
//  .then((data)=>{
//    res.json(data);
//  })                                commented out this function for another function in assignment 4 
//  .catch(err=>{
//    res.json(err);
//  })
//});

//assignment 4 part 3 step 3 (modification of function above that's commented out)
app.get("/stores", function(req,res){
  if (req.query.retailer){
  dataService.getStoresByRetailer(req.query.retailer)
  .then((data)=>{
    res.render("stores", {stores: data});
  })
  .catch(err=>{
    res.json(err);
  })
  }
  else{
      dataService.getStores()
      .then((data)=>{
      res.render("stores", {stores: data});
    })                                
    .catch(err=>{
      res.json(err);
    })
  }
});

//Assignment 4
//Part 1, using render instead of sendFile
app.get("/people/add", function(req, res){
  res.render("addPeople", {   
  })
});

app.get("/pictures/add", function(req, res){
  res.render("addImage", {  
  })
});

//part 2 continues here from the top
app.post("/pictures/add", upload.single("pictureFile"), (req, res) => {
  res.redirect("/pictures");
});

var fs = require("fs");

app.get("/pictures", function(req, res){
 fs.readdir('./public/pictures/uploaded', (err, data) => {   
   res.render("pictures", {      //assignment 4 part 2 step 1: instead of using res.json(array); , use render and pass picture array
     pictures: data
   });     
  });   
});

//Part 3
//body-parser extract the entire body portion of an incoming request stream and exposes it on req.body.
const bodyParser =  require ("body-parser");

app.use(bodyParser.urlencoded({ extended: true }))
 
//adding route to make a call to addPeople function from data-service.js 
app.post("/people/add", (req, res) => {
  //.then is used because promised is used. If promise is resolved (ex: resolve()), the parameter within resolve() will be 
  //passed to .then().
   dataService.addPeople(req.body).then(()=>{
     res.redirect('/people');
    });
});

//Part 4 is near the top of assignment and below

app.get("/person/:value", function(req,res){
  dataService.getPeopleById(req.params.value) //params is used if user enters /people/value
  .then((data)=>{
    res.render("person", { person: data[0] });
  })
  .catch(err=>{
    res.render("person",{message:"no results"});
  })
})

app.post("/person/update", (req, res) => {     
  dataService.updatePerson(req.body)
  .then(()=>{  
    console.log(req.body);     
    res.redirect("/people");})
}); 


//this * means everything. If requested file isn't found, this function will
//display an error
app.get('*', function(req, res) {  
  res.send('<h3>page not found<h3>');
});
// setup http server to listen on HTTP_PORT and then calls onHTTpStart once connection
//has been made

dataService.initialize()
.then(()=>{
  app.listen(HTTP_PORT, onHttpStart);
})
.catch(err=>{
  console.log(err);
})

