var express = require('express');
var async = require('async');
var Tags = require('../Validator.js').Tags;
var AllowedFields = require('../Validator.js').AllowedFields;
var RequiredFields = require('../Validator.js').RequiredFields;

var router = express.Router();

router.baseURL = '/api/user'

/* GET /api/users/
 * Get list of users.
 * Requires admin permissions to receive all users or returns just the AU
 */
router.get('/', function(req, res, next) {
  var options = {
     attributes: ['id', 'username', 'first_name', 'last_name']
  }

  if (req.query.search) {
     options.where = {
        username: { $like: '%' + req.query.search + '%' },
        id: { $ne: req.session.id }
     }
  } else {
     options.where = {
       id: { $ne: req.session.id }
     }
 }

  req.db.user.findAll(options)
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

  if (vld.hasFields(body, RequiredFields.postUser, null) &&
      vld.allowOnlyFields(body, AllowedFields.postUser, null) &&
      vld.check(body.role != 'admin', Tags.noPermission, null)) {

    req.db.user.findOrCreate({
      where: {
        username: body.username
      },
      attributes: ["id", "username", "first_name", "last_name", "role"],
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
          data: {id: user[0].id, username: user[0].username, role: user[0].role}
        }).status(200).end()
    })
  }
});


router.get('/:id', function(req, res, next) {
  req.db.user.findOne({
    where: { id: req.params.id },
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

  if (vld.allowOnlyFields(body, AllowedFields.putUser, null)) {
    req.db.user.update(body, { where: {id: req.params.id }})
    .then(user => {
      res.json({ status: "success", data: [] })
    })
  }
});

/* DELETE /api/users/:id
 * Allows an Admin to delete a user
 */
router.delete('/:id', function(req, res, next) {
  var vld = req.validator;

  if (vld.checkAdmin()) {
    req.db.user.destroy({where: {id: req.params.id}})
    .then(user => {
        res.json({ status: "success" }).status(200).end()
    })
    .catch(error => {
        res.json({ status: "error", error: error })
    });
  }
});

module.exports = router;
