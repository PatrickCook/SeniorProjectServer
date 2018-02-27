var express = require('express');
var async = require('async');

var router = express.Router();

router.baseURL = '/api/users'

const AllowedFields = {
  putUser: ["username", "first_name", "last_name", "password_hash"]
}

const RequiredFields = {
  postUser: ["username", "first_name", "last_name", "password_hash"]
}
/* GET /api/users/
 * Get list of users.
 * Requires admin permissions to receive all users or returns just the AU
 */
router.get('/', function(req, res, next) {
  req.db.users.findAll({
    attributes: ['id', 'username', 'first_name', 'last_name']
  })
  .then(users => {
      res.json({
          status: "success",
          data: users
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

  async.waterfall([
  function(cb) {
    if (vld.hasFields(body, RequiredFields.postUser, cb)) {
      req.db.users.findOrCreate({
        where: {
          username: body.username
        },
        defaults: {
          username: body.username,
          first_name: body.first_name,
          last_name: body.last_name,
          role: body.role,
          password_hash: body.password_hash
        }
      })
      .then(user => {
          res.json({
              status: "success",
              data: {
                id: user[0].id,
                username: user[0].username,
                first_name: user[0].first_name,
                last_name: user[0].last_name,
                role: user[0].role

              }
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
  }],
  function (error) {
    res.status(200).end();
  });
});

/* GET /api/users/:id
 * Allows an admin to receive information on a user.
 * If not admin returns AU info regardless of id given
 * Body Response: {id, username, [groups]}
 * Returns list of groups a user is part of
 */
router.get('/:id', function(req, res, next) {
  req.db.users.findOne({
    where: {
      id: req.params.id
    },
    attributes: ['username', 'first_name', 'last_name']
  })
  .then(user => {
    if (user)
      res.json(user);
    res.status(404).json("User not found")
  });
});

/* PUT /api/users/:id
 * Allows a user to update their access and refresh tokens for Spotify.
 * Requires AU and perm = 1 or admin.
 * Primarily used for refreshing Spotify access tokens
 */
router.put('/:id', function(req, res, next) {
  let body = req.body
  let vld = req.validator
  console.log(req.body)

  async.waterfall([
  function(cb) {
    if (vld.allowOnlyFields(body, AllowedFields.putUser, cb)) {
      req.db.users.update(body, { where: {id: req.params.id }})
      .then(user => {
        res.json({
          status: "success",
          data: user
        })
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

/* DELETE /api/users/:id
 * Allows an Admin to delete a user
 */
router.delete('/:id', function(req, res, next) {
  req.db.users.destroy({where: {id: req.params.id}})
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
});

module.exports = router;