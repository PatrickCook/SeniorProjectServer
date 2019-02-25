var express = require('express');
var async = require('async');
var Tags = require('../Validator.js').Tags;
var AllowedFields = require('../Validator.js').AllowedFields;
var RequiredFields = require('../Validator.js').RequiredFields;

var router = express.Router();

router.baseURL = '/api/song'

router.put('/:id/vote', function(req, res, next) {
   var vld = req.validator
   var songId = req.params.id
   var userId = req.session.id

   // Get song and get it's queue
   req.db.song.findById(songId).then(song => {
      if (!song) {
         throw "couldnt find song";
      }
      return req.db.sequelize.query(
         `SELECT COUNT(*) as 'allowed' FROM UserQueue ` +
         `WHERE QueueId=${song.queueId} AND UserId=${userId}`
      )
   }).spread((result, metadata) => { // Ensure user is contained in queue
      if (result[0].allowed) {
         req.db.song.findById(songId)
         .then(song => {
            req.pusher.trigger('my-channel', 'song-upvoted', {
              "message": "Refresh queue after user voted",
              "queueId": song.queueId
            });
            return song.createVote({
               SongId: songId,
               UserId: userId,
            })
         }).then(result => {
            res.status(200).json({
               status: "success", error: ""
            })
         }).catch((error) => {
            res.status(200).json({
               status: "success", error: error
            })
         })
      } else {
         res.status(401).json({
            status: "error", error: "User must be member of queue to upvote"
         })
         return;
      }
   }).catch(error => {
      res.status(404).json({
         status: "success", error: error
      })
   })
})

router.post('/:id/playing', function(req, res, next) {
   var vld = req.validator;
   var songId = req.params.id
   var userId = req.session.id;

   if (vld.hasFields(req.body, RequiredFields.isPlayingSong, null)) {
      var queueID = req.body.queueID;

      req.db.sequelize.query(`SELECT COUNT(*) as allowed FROM UserQueue WHERE QueueId=${queueID} AND UserId=${userId}`)
      .spread((result, metadata) => {
         if (result[0].allowed || vld.checkAdmin()) {
            req.db.song.update(
               {
                  isPlaying: req.body.isPlaying
               },
               {where: {id: songId}}
            ).then(song => {
               if (song) {
                  req.pusher.trigger('my-channel', 'song-playback-changed', {
                     status: "success",
                     message: "Song playback changed",
                     songId: songId,
                     isPlaying: req.body.isPlaying
                  });
                  res.json({ status: "success" }).status(200).end()
               }
            })
         } else {
            res.status(401).json({
               status: "error",
               error: "user is not member of queue",
               data: []})
         }
     });
   }
});

module.exports = router;
