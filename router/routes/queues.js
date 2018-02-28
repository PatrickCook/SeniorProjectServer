var express = require('express');
var async = require('async');
var Tags = require('../Validator.js').Tags;
var AllowedFields = require('../Validator.js').AllowedFields;
var RequiredFields = require('../Validator.js').RequiredFields;
var MaxFields = require('../Validator.js').MaxFields;

var router = express.Router();

router.baseURL = '/api/queues'

/* GET /api/users/
 * Get list of users.
 * Requires admin permissions to receive all users or returns just the AU
 */
router.get('/', function(req, res, next) {
  let filter = {}

  if (req.query.owner)
    filter.owner = req.query.owner

  if (req.query.name)
    filter.name = req.query.name

  req.db.queue.findAll({
    where: filter,
    attributes: ['id', 'owner', 'name', 'max_members', 'max_songs',
                 'private', 'createdAt', 'updatedAt']
  })
  .then(queues => {
      res.json({
          status: "success",
          data: queues
      }).status(200).end()
  })
  .catch(error => {
      res.json({
        status: "error",
        error: error,
        data: []
      })
  });
});

/* POST /api/users/
 * Allows a user to register.
 * Body: username, password, perm
 * Requires: username, password, perm.
 * Perm = 0 for Guest, Perm = 1 for Spotify User
 */
router.post('/', function(req, res, next) {
  let body = req.body
  let vld = req.validator
  console.log("Private", !body.private)
  async.waterfall([
  function(cb) {
    if (vld.hasFields(body, RequiredFields.postQueue, cb) &&
        vld.allowOnlyFields(body, AllowedFields.postQueue, cb) &&
        vld.check(!body.private|| (body.private && body.password), Tags.missingField, ["password"], cb)) {

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
          cur_members: 0,
          max_members: MaxFields.QUEUE_MEMBERS,
          cur_songs: 0,
          max_songs: MaxFields.QUEUE_SONGS
        }
      })
      .then(queue => {
          res.json(queue).status(200).end()
      })
      .catch(error => {
          res.json({
            status: "error",
            error: error,
            data: []
          })
      });
    }
  }],
  function (error) {
    res.status(200).end();
  });
});

/* GET /api/queues/:id
 * Allows an admin to receive information on a user.
 * If not admin returns AU info regardless of id given
 * Body Response: {id, username, [groups]}
 * Returns list of groups a user is part of
 */
router.get('/:id', function(req, res, next) {
  req.db.queue.findAll({
    where: {id: req.params.id },
    attributes: ['id', 'owner', 'name', 'max_members', 'max_songs',
                 'private', 'createdAt', 'updatedAt']
  })
  .then(queues => {
      res.json({
          status: "success",
          data: queues
      }).status(200).end()
  })
  .catch(error => {
      res.json({
        status: "error",
        error: error,
        data: []
      })
  });
});



/* DELETE /api/queues/:id
 * Allows an Admin to delete a user
 */
router.delete('/:id', function(req, res, next) {
  var vld = req.validator;

  if (vld.checkPrsOK(req.session.id)) {
    req.db.queue.destroy({where: {id: req.params.id}})
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
