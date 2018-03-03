var express = require('express');
var async = require('async');
var Tags = require('../Validator.js').Tags;
var AllowedFields = require('../Validator.js').AllowedFields;
var RequiredFields = require('../Validator.js').RequiredFields;

var router = express.Router();

router.baseURL = '/api/queue'

/* GET /api/users/
 * Get list of users.
 * Requires admin permissions to receive all users or returns just the AU
 */
 router.post('/:id/join', function(req, res, next) {
   req.db.queue.findOne({where: {id: req.params.id}})
   .then(queue => {
     req.db.user.findOne({where: {id: req.session.id}})
     .then(user => {
       queue.addUser(user)
       .then(result => res.json({status: "success", data: result}))
     })
   })
 });


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
