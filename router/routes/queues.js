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
         attributes: ["id", "username", "first_name", "last_name"],
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

/* POST /api/queue/
 * Allows user to create queue
 */
router.post('/', function(req, res, next) {
  let body = req.body
  let vld = req.validator
  console.log(body)
  if (vld.hasFields(body, RequiredFields.postQueue, null) &&
      vld.allowOnlyFields(body, AllowedFields.postQueue, null) &&
      vld.check(!body.private|| (body.private && body.password),
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
        private: body.private,
        password: body.password ? body.password : null,
        cur_members: body.members.length + 1,
        max_members: MaxFields.QUEUE_MEMBERS,
        cur_songs: 0,
        max_songs: MaxFields.QUEUE_SONGS
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
        attributes: ['id', 'owner', 'name', 'max_members', 'max_songs',
                     'private', 'createdAt', 'updatedAt'],
        include: [{
          model: req.db.user,
          attributes: ["id", "username", "first_name", "last_name"],
          through: { attributes: [] }
        }, {
          model: req.db.song
        }]
      })
      .then(queue => {
        if (queue)
          res.status(200).json({ status: "success", data: queue })
        else
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
