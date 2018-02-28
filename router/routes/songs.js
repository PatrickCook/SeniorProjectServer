var express = require('express');
var async = require('async');
var Tags = require('../Validator.js').Tags;
var AllowedFields = require('../Validator.js').AllowedFields;
var RequiredFields = require('../Validator.js').RequiredFields;

var router = express.Router();

router.baseURL = '/api/queues'

/* GET /api/users/
 * Get list of users.
 * Requires admin permissions to receive all users or returns just the AU
 */
 router.post('/:id/songs', function(req, res, next) {
   req.db.queue.findOne({where: {id: req.params.id}})
   .then(queue => {
     queue.createSong({
       votes: 0,
       spotify_uri: "testURI",
       userId: req.session.id
     })
     res.json({status: "success", msg: "song added to queue"}).end();
   })
   .catch(error => {
       res.json({
         status: "error",
         error: error,
         data: []
       })
   });
 });


router.get('/:id/songs', function(req, res, next) {
  req.db.queue.findOne({where: {id: req.params.id}})
  .then(queue => {
    if (queue) {
      queue.getSongs().then(songs => {
        res.json({ status: "success", data: songs})
      })
    } else {
      res.json({ status: "succcess", data: []})
    }
  })
  .catch(error => {
      res.json({
        status: "error",
        error: error,
        data: []
      })
  });
});


/* DELETE /api/users/:id
 * Allows an Admin to delete a user
 */
router.delete('/:id/songs/:songId', function(req, res, next) {
  var vld = req.validator;

  if (vld.checkAdmin()) {
    req.db.song.destroy({where: {id: req.params.id}})
    .then(user => {
        res.json({
            status: "success"
        }).status(200).end()
    })
    .catch(error => {
        res.json({
          status: "error",
          error: error,
          data: []
        })
    });
  }
});

module.exports = router;
