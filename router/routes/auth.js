var express = require('express');
var async = require('async');
var sessionUtil = require('../Session.js');
var Tags = require('../Validator.js').Tags;
var AllowedFields = require('../Validator.js').AllowedFields;
var RequiredFields = require('../Validator.js').RequiredFields;

var router = express.Router();

router.baseURL = '/api/auth'


router.post('/', function(req, res, next) {
  let body = req.body;
  let db = req.db;
  let vld = req.validator;

  async.waterfall([
  function(cb) {
    if (vld.allowOnlyFields(body, AllowedFields.postAuth, cb) &&
        vld.hasFields(body, RequiredFields.postAuth, cb)) {

      db.user.findOne({ where: {username: body.username }})
      .then(result => {
        if (vld.check(result &&
         result.passwordHash === body.passwordHash, Tags.badLogin, null, null)) {
          cookie = sessionUtil.makeSession(result, res);

          res.location(router.baseURL + '/' + cookie).status(200).json({
            status: "success",
            data: result
          })
        }
      })
      .catch(error => {
          res.status(404).json({
            status: "error",
            error: "user not found"
          })
      });
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
