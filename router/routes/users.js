var express = require('express');
var async = require('async');

var router = express.Router();

router.baseURL = '/api/users'

/* GET /api/users/
 * Get list of users.
 * Requires admin permissions to receive all users or returns just the AU
 */
router.get('/', function(req, res, next) {
  res.json("Get list of users");
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
    if (vld.hasFields(body, ["username", "first_name", "last_name", "role"], cb)) {
      req.db.users.create({
        username: body.username,
        first_name: body.first_name,
        last_name: body.last_name,
        role: body.role,
        created_at: new Date()
      })
      .then(user => {
        res.json(user);
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
  res.json("Get user " + req.params.id);
});

/* PUT /api/users/:id
 * Allows a user to update their access and refresh tokens for Spotify.
 * Requires AU and perm = 1 or admin.
 * Primarily used for refreshing Spotify access tokens
 */
router.put('/:id', function(req, res, next) {
  res.json("Update user " + req.params.id);
});

/* DELETE /api/users/:id
 * Allows an Admin to delete a user
 */
router.delete('/:id', function(req, res, next) {
  res.json("Delete user " + req.params.id);
});

module.exports = router;
