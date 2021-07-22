const functions = require("firebase-functions");
const admin = require('firebase-admin');
const perf = firebase.performance();

admin.initializeApp();

require("dotenv").config();
const express = require('express');
const app = express();
const mailchimp = require('./js/mailchimp');

var path = require ('path');
app.use(express.static(path.join(__dirname)));

app.set('view engine', 'ejs');
app.use(express.urlencoded());
app.use(express.json());

app.get('/', (req, res) => {
  //handle root
  res.render('index');
});

app.get('/thankyou', (req, res) => {
  //handle root
  res.render('thankyou');
});

app.get('/test', (req, res) => {
  //handle root
  res.render('test');
});

app.post('/endpoint', async function(req, res) {
  var name = req.body[0].value; 
  var email = req.body[1].value;

  var data = {}
  data.name = name;
  
  try {
    await mailchimp.addSubscriber(email, data, true);
  }catch(err){
    console.log("Mailhimp error: " + err);
    return
  }
  
  res.send({redirect: '/thankyou'});
});

exports.app = functions.https.onRequest(app);
