var express = require('express');
var async = require('async');
var Tags = require('../Validator.js').Tags;
var AllowedFields = require('../Validator.js').AllowedFields;
var RequiredFields = require('../Validator.js').RequiredFields;
var MaxFields = require('../Validator.js').MaxFields;

var router = express.Router();

router.baseURL = '/api/queue'

/* GET /api/queue/
* Get list of users.
* Requires admin permissions to receive all users or returns just the AU
*/
router.get('/', function(req, res, next) {
   let filter = {}

   if (req.query.owner)
      filter.owner = req.query.owner

   if (req.query.name)
      filter.name = { $like: '%' + req.query.name + '%' }

   req.db.queue.findAll({
      where: filter,
      include: [{
         model: req.db.user,
         attributes: ["id", "username", "role"],
      }]
   })
   .then(result => {
      result.forEach((queue) => {
         queue.dataValues.ownerUsername = queue.dataValues.Users[0].username
      })
      res.json({
         status: "success",
         data: result
      }).status(200).end()
   })
   .catch(error => {
      res.json({status: "error", error: error, data: []})
   });
});

router.get('/my', function(req, res, next) {
   let currentUser;
   let filter = {}

   if (req.query.owner)
      filter.owner = req.query.owner

   req.db.user.findAll({
      where: { id: req.session.id },
      include: [{
         model: req.db.queue,
      }]
   })
   .then(result => {
      res.json({ status: "success", data: result }).status(200).end()
   })
   .catch(error => {
      res.json({status: "error", error: error, data: []})
   });
});

/* POST /api/queue/
* Allows user to create queue
*/
router.post('/', function(req, res, next) {
   let body = req.body
   let vld = req.validator
   console.log(body)
   if (vld.hasFields(body, RequiredFields.postQueue, null) &&
    vld.allowOnlyFields(body, AllowedFields.postQueue, null) &&
    vld.check(!body.isPrivate|| (body.private && body.password),
    Tags.missingField, ["password"], null)) {

      let password = body.password ? body.password : null;
      req.db.queue.findOrCreate({
         where: {
            owner: req.session.id,
            name: body.name
         },
         defaults: {
            name: body.name,
            owner: req.session.id,
            isPrivate: body.isPrivate,
            password: body.password ? body.password : null,
            curMembers: body.members.length + 1,
            maxMembers: MaxFields.QUEUE_MEMBERS,
            curSongs: 0,
            maxSongs: MaxFields.QUEUE_SONGS,
            isPlaying: false,
            playingUserId: -1
         }
      })
      .then(queue => {
         let members = body.members
         members.push(req.session.id)
         members.forEach(function(member) {
            req.db.user.findOne({where: {id: member}}).then(user => {
               queue[0].addUser(user)
            })
         });
         res.json({status: "success", data: queue[0]})
      })
   }
});

/*
* GET /api/queue/:id
* Allows member of queue to get queue info and songs
*/
router.get('/:id', function(req, res, next) {
   var vld = req.validator;
   var queueId = req.params.id
   var userId = req.session.id

   req.db.sequelize.query(`SELECT COUNT(*) as allowed FROM UserQueue ` +
   `WHERE QueueId=${queueId} AND UserId=${userId}`)
   .spread((result, metadata) => {
      if (result[0].allowed || vld.checkAdmin()) {
         req.db.queue.findById(req.params.id, {
            include: [{
               model: req.db.user,
               attributes: ["id", "username", "role"],
               through: { attributes: [] }
            }, {
               model: req.db.song,
               include: [{
                  model:req.db.vote,
                  as: 'votes'
               }, {
                  model:req.db.user,
                  attributes: ["username"],
                  as: 'queuedBy'
               }],
            }]
         })
         .then(queue => {
            if (queue) {
               res.status(200).json({ status: "success", data: queue })
            } else
            res.status(404).json({
               status: "error",
               error: "Queue does not exist",
               data: []
            })
         })
      } else {
         res.status(401).json({
            status: "error",
            error: "user is not member of queue",
            data: []})
         }
      });
   });

router.get('/:id', function(req, res, next) {
   var vld = req.validator;
   var queueId = req.params.id
   var userId = req.session.id

   req.db.sequelize.query(`SELECT COUNT(*) as allowed FROM UserQueue ` +
   `WHERE QueueId=${queueId} AND UserId=${userId}`)
   .spread((result, metadata) => {
      if (result[0].allowed || vld.checkAdmin()) {
         req.db.queue.findById(req.params.id, {
            include: [{
               model: req.db.user,
               attributes: ["id", "username", "role"],
               through: { attributes: [] }
            }, {
               model: req.db.song,
               include: [{
                  model:req.db.vote,
                  as: 'votes'
               }, {
                  model:req.db.user,
                  attributes: ["username"],
                  as: 'queuedBy'
               }],
            }]
         })
         .then(queue => {
            if (queue) {
               res.status(200).json({ status: "success", data: queue })
            } else
            res.status(404).json({
               status: "error",
               error: "Queue does not exist",
               data: []
            })
         })
      } else {
         res.status(401).json({
            status: "error",
            error: "user is not member of queue",
            data: []})
      }
   });
});

router.post('/:id/playing', function(req, res, next) {
   var vld = req.validator;
   var queueId = req.params.id;
   var userId = req.session.id;

   if (vld.hasFields(req.body, RequiredFields.isPlayingQueue, null)) {

      req.db.sequelize.query(`SELECT COUNT(*) as allowed FROM UserQueue WHERE QueueId=${queueId} AND UserId=${userId}`)
      .spread((result, metadata) => {
         if (result[0].allowed || vld.checkAdmin()) {
            req.db.queue.update(
               {
                  isPlaying: req.body.isPlaying,
                  playingUserId: req.body.isPlaying ? userId : -1
               },
               {where: {id: queueId}}
            ).then(queue => {
               if (queue) {
                  req.pusher.trigger('my-channel', 'queue-playback-changed', {
                     status: "success",
                     message: "Queue playback changed",
                     queueId: queueId,
                     isPlaying: req.body.isPlaying,
                     playingUserId: req.body.isPlaying ? userId : -1
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



/* DELETE /api/queues/:id
* Allows an Admin or owner to delete a queue
*/
router.delete('/:id', function(req, res, next) {
   var vld = req.validator;

   if (vld.checkPrsOK(req.session.id)) {
      req.db.queue.destroy({where: {id: req.params.id}})
      .then(user => {
         res.json({ status: "success" }).status(200).end()
      })
      .catch(error => {
         res.json({ status: "error", error: error, data: [] })
      });
   }
});

/*
* POST /api/queue/:id/songs
* Allows user to add song to a queue
*/
router.post('/:id/songs', function(req, res, next) {
   var vld = req.validator;
   var body = req.body
   var queueId = req.params.id
   var userId = req.session.id

   req.db.sequelize.query(`SELECT COUNT(*) as allowed FROM UserQueue ` +
   `WHERE QueueId=${queueId} AND UserId=${userId}`)
   .spread((result, metadata) => {
      if ((result[0].allowed || vld.checkAdmin()) &&
       vld.hasFields(body, RequiredFields.postSong, null)) {

         req.db.queue.findOne({where: {id: queueId}})
         .then(queue => {
            queue.createSong({
               title: body.title,
               artist: body.artist,
               albumURI: body.albumURI,
               previewURI: body.previewURI ? body.previewURI : null,
               spotifyURI: body.spotifyURI,
               isPlaying: false,
               owner: userId,
               votes: 0
            }).then(song => {
               req.pusher.trigger('my-channel', 'song-added-to-queue', {
                  status: "success",
                  message: "Song added to queue",
                  queueId: queueId,
                  song: song
               });
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

/*
* GET /api/queue/:id/songs
* Allows user to get list of songs
*/
router.get('/:id/songs', function(req, res, next) {
   var vld = req.validator;
   var queueId = req.params.id
   var userId = req.session.id

   req.db.sequelize.query(`SELECT COUNT(*) as allowed FROM UserQueue ` +
   `WHERE QueueId=${queueId} AND UserId=${userId}`)
   .spread((result, metadata) => {
      if (result[0].allowed || vld.checkAdmin()) {
         req.db.song.findAll({where: {queueId: req.params.id}})
         .then(song => {
            res.json({ status: "success", data: song})
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


/* DELETE /api/queue/:id
* Allows an Admin to delete a song
*/
router.delete('/:id/songs/:songId', function(req, res, next) {
   var vld = req.validator;
   var queueId = req.params.id
   var userId = req.session.id
   var songId = req.params.songId

   req.db.sequelize.query(`SELECT COUNT(*) as allowed FROM UserQueue ` +
   `WHERE QueueId=${queueId} AND UserId=${userId}`)
   .spread((result, metadata) => {
      if (result[0].allowed || vld.checkAdmin()) {
         req.db.song.destroy({where: {id: songId}})
         .then(user => {
            req.db.queue.findOne({where: {id: queueId}}).then(queue => {
               req.pusher.trigger('my-channel', 'song-deleted-from-queue', {
                  status: "success",
                  message: "Song deleted from queue",
                  queueId: queueId,
                  songId: songId
               });
               res.json({ status: "success" }).status(200).end()
            })
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

/*
queue.getSongs().then(songs => {
   queue.setCurrentSong(songs[0]);
}).then(song => {
   queue.removeSong(song)
}).then(song => {
   req.pusher.trigger('my-channel', 'queue-playback-changed', {
      status: "success",
      message: "Queue playback changed",
      queueId: queueId,
      isPlaying: req.body.isPlaying,
      playingUserId: req.body.isPlaying ? userId : -1
   });
   res.json({ status: "success" }).status(200).end()
}).catch(error => {
   console.log(error)
})
*/
