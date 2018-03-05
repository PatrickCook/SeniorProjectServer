var express = require('express');
var async = require('async');
var Tags = require('../Validator.js').Tags;
var AllowedFields = require('../Validator.js').AllowedFields;
var RequiredFields = require('../Validator.js').RequiredFields;

var router = express.Router();

router.baseURL = '/api/queue'

/*
 * POST /api/queue/:id/join
 * Allows user to join a queue
 */
 router.post('/:id/join', function(req, res, next) {
   var ssn = req.session
   var vld = req.validator
   var body = req.body

   if (vld.allowOnlyFields(body, AllowedFields.postJoin, null) &&
      vld.check(!body.hasOwnProperty('password') || body.password,
    Tags.missingField, ["password"], null)) {

      req.db.queue.findOne({where: {id: req.params.id}})
      .then(queue => {
        if (!queue.password || queue.password === req.body.password || ssn.isAdmin()) {
          req.db.user.findOne({where: {id: req.session.id}})
          .then(user => {
            queue.addUser(user)
            .then(result => res.json({status: "success", data: result}))
          })
        } else {
          res.status(401).json({
            status: "error",
            error: "Correct password required"
          })
        }
      })
   }
 });

 /*
  * DELETE /api/queue/:id/leave
  * Allows user to join a queue. Error if user is owner of queue
  */
router.delete('/:id/leave', function(req, res, next) {
  req.db.queue.findOne({where: {id: req.params.id}})
  .then(queue => {
    req.db.user.findOne({where: {id: req.session.id}})
    .then(user => {
      if (queue.owner === user.id) {
        res.json({status: "error", error: "Cannot leave queue that you own"})
      } else {
        queue.removeUser(user)
        .then(result => res.json({status: "success", data: []}))
      }
    })
  })
});

module.exports = router;
