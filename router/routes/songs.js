var express = require('express');
var async = require('async');
var Tags = require('../Validator.js').Tags;
var AllowedFields = require('../Validator.js').AllowedFields;
var RequiredFields = require('../Validator.js').RequiredFields;

var router = express.Router();

router.baseURL = '/api/queue'

/*
 * ALlows user to add song to a queue
 */
 router.post('/:id/songs', function(req, res, next) {
   var vld = req.validator;
   var queueId = req.params.id
   var userId = req.session.id

   req.db.sequelize.query(`SELECT COUNT(*) as allowed FROM UserQueue ` +
                           `WHERE QueueId=${queueId} AND UserId=${userId}`)
   .spread((result, metadata) => {
     if (result[0].allowed || vld.checkAdmin()) {
       req.db.queue.findOne({where: {id: queueId}})
       .then(queue => {
         queue.createSong({ spotify_uri: "testURI", userId: userId})
         .then(song => {
           res.json({status: "success", data: song})
         })
       })
     } else {
       res.status(401).json({
         status: "error",
         error: "user not member of queue"
       })
     }
   })
 });


router.get('/:id/songs', function(req, res, next) {
  req.db.songs.findOne({where: {id: req.params.id}})
  .then(song => {
      res.json({ status: "success", data: song})
  })
  .catch(error => {
      res.json({ status: "error", error: error })
  });
});


/* DELETE /api/users/:id
 * Allows an Admin to delete a user
 */
router.delete('/:id/songs/:songId', function(req, res, next) {
  var vld = req.validator;
  var queueId = req.params.id
  var userId = req.session.id

  req.db.sequelize.query(`SELECT COUNT(*) as allowed FROM UserQueue ` +
                          `WHERE QueueId=${queueId} AND UserId=${userId}`)
  .spread((result, metadata) => {
    if (result[0].allowed || vld.checkAdmin()) {
      req.db.song.destroy({where: {id: req.params.id}})
      .then(user => {
          res.json({ status: "success" }).status(200).end()
      })
      .catch(error => {
          res.json({ status: "error", error: error })
      });
    } else {
      res.status(401).json({
        status: "error",
        error: "user not member of queue"
      })
    }
  })
});

module.exports = router;
