var express = require('express');
var async = require('async');
var sessionUtil = require('../Session.js');
var Tags = require('../Validator.js').Tags;

var router = express.Router();

router.baseURL = '/api/auth'

const AllowedFields = {
  postAuth: ['username', 'password_hash']
}

const RequiredFields = {
  postAuth: ['username', 'password_hash']
}


router.post('/', function(req, res, next) {
  let body = req.body;
  let db = req.db;
  let vld = req.validator;
  console.log("Auth POST")

  async.waterfall([
  function(cb) {
    if (vld.allowOnlyFields(body, AllowedFields.postAuth, cb) &&
        vld.hasFields(body, RequiredFields.postAuth, cb)) {

      db.users.findOne({
        where: {
          username: body.username
        }
      })
      .then(result => {
        console.log(result.password_hash, body.password_hash)
        if (vld.check(result &&
         result.password_hash === body.password_hash, Tags.badLogin, null, cb)) {
          cookie = sessionUtil.makeSession(result, res);
          res.location(router.baseURL + '/' + cookie).status(200).end();
        }
      })
    }
  }],
  function (error) {
    res.status(200).end();
  });
});

router.delete('/:cookie', function(req, res) {
   var cookie = req.params.cookie;
   var vld = req.validator;

   if (vld.check(sessionUtil.sessions[cookie], Tags.notFound)) {
    if (req.session.isAdmin()) {
     sessionUtil.deleteSession(cookie);
     res.status(200).end();

   } else if (vld.check(cookie === req.cookies[sessionUtil.cookieName],
     Tags.noPermission)) {
     sessionUtil.deleteSession(cookie);
     res.status(200).end();
    }
   }
   req.cnn.release();
});

module.exports = router;
