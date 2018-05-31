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
      return req.db.sequelize.query(
        `SELECT COUNT(*) as 'allowed' FROM UserQueue ` +
        `WHERE QueueId=${song.queueId} AND UserId=${userId}`
      )
  }).spread((result, metadata) => { // Ensure user is contained in queue
    if (result[0].allowed) {
      return req.db.sequelize.query(
        `SELECT COUNT(*) as 'exists' FROM UserVotes ` +
        `WHERE songId=${songId} AND userId=${userId}`
      )
    } else {
      res.status(401).json({
        status: "error", error: "User must be member of queue to upvote"
      })
      return;
    }
  }).spread((result, metadata) => { // Upvote and increment songs votes
    if (!result[0].exists || vld.checkAdmin()) {
      req.db.vote.create({
        songId: songId,
        userId: userId
      }).then(vote => {
        req.db.song.findById(songId)
        .then(song => {
          return song.increment('votes', {by: 1})
       }).then(result => {
          res.status(200).json({
            status: "success", error: ""
          })
       })
     })
    }
  })
})

module.exports = router;
