var express = require('express');
var router = express.Router();


router.baseURL = '/api'

/* GET home page. */
router.get('/', function(req, res, next) {
  var jsonResult = {
    "app": "REST API: Spotify Queue Senior Project",
    "authors": "Patrick Cook, Jason Jeung",
    "date": "2018"
  }
  res.json(jsonResult).end()
});

module.exports = router;
