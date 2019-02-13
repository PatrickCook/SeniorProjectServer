# REST API - Spotify Senior Project

## Getting Started
To start the REST api clone the repo and `cd` into the directory. The `app.js` is the file used to start the server. The folder `router` contains all files corresponding with each endpoint documented below. The `models` folder contains all database model representations. Lastly, the `migrations` and `seeders` folders contain database migration and database seeding files.

#### To Run:
```
- npm install
- node app.js
sequelize db:seed:all
```

#### Database Configuration
All database Configuration code is contained in the `config` folder. Edit the following to lines to connect your database with the server.
```
"development": {
  "username": "MYSQL_USERNAME",
  "password": "MYSQL_PASSWORD",
  "database": "DATABASE_NAME",
  "host": "DATABASE_URL",
  "dialect": "mysql" // Compatible with others, just google sequelize
}
```

### Endpoint Todos:
* Require admin to get list of users
* Require admin to change role of user
* Ensure client is the same as the user they are trying to update in a PUT
* Correctly order queue songs on GET /api/queue/:id
* Return 404 when deleting song if the song doesnt exist in queue

## Endpoint Documentation:
Outlined below is a list of REST API endpoints which support the following actions:

* Create, Update, Delete User
* User login, session creation and session deletion
* Create or Delete Queue
* Join or Leave Queue
* Add or remove song from queue

##### Authentication:
* All endpoints except `POST /api/user` and `POST /api/auth` require the user to be authenticated and to provide their session cookie with each request for verification.

## User

### GET /api/user
* Allows Admin to retrieve list of all users. If user is not admin only the users information is returned

**Example Response:**
```
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "username": "admin",
            "first_name": "-",
            "last_name": "-"
        },
    ]
}
```

### POST /api/user
* Allows an unauthorized person to create a new user. Only an admin can create a user with role `admin`
* Required Fields: `username, first_name, last_name, passwordHash, role`
* New user id is returned in the header of the response

**Example Response:**

```
{
    "status": "success",
    "data": {
        "id": 1,
        "username": "newUser",
        "role": "user"
    }
}
```

### GET /api/user/:id
* Returns the user information associated with `id` provided

**Example Response:**
```
{
    "status": "success",
    "data": {
        "username": "admin",
        "first_name": "-",
        "last_name": "-"
    }  
}
```

### PUT /api/user/:id
* Allows a user to update and of the following fields: `username, first_name, last_name, passwordHash`

**Example Request Body:**
```
{
	"username": "newUsername",
	"first_name": "Update",
	"last_name": "Me",
	"passwordHash": "resetmypassword"
}
```
**Example Response:**
```
{
    "status": "success",
    "data": []
}
```

### DELETE /api/user/:id
* Allows an admin to delete a user account.

**Example Response:**
```
{
    "status": "success",
    "data": []
}
```

## Queue

### GET /api/queue [?owner=ownerId, name=ownerUserName]
* Allows a user to get a list of all queues. In the future this will be limited to only return queues the user is a part of.
* An optional `owner` and `name` query parameter can be used to filter the list of queues returned.

**Example Response:**
```
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "owner": 1,
            "name": "Queue 1",
            "maxMembers": 20,
            "maxSongs": 20,
            "private": false,
            "createdAt": "2018-03-03T21:03:04.000Z",
            "updatedAt": "2018-03-03T21:03:04.000Z",
            "Users": [
                {
                    "id": 1,
                    "username": "admin",
                    "first_name": "-",
                    "last_name": "-"
                },
                {
                    "id": 2,
                    "username": "pcook",
                    "first_name": "Patrick",
                    "last_name": "Cook"
                }
            ]
        }
    ]
}
```

### POST /api/queue
* Allows a user to create a new queue. If the queue is marked as `private` a `password` field must be present and non-null. The user creating the queue is automatically added a member of the queue and is set as the owner. If the user has already created a queue with the same `name` then a new queue is NOT created.
* Required Body Fields: `name, private, password`

**Example Response:**
```
{
    "status": "success",
    "data": {
        "id": 1,
        "name": "Queue Name",
        "owner": 1,
        "private": false,     // If true 'password' cannot be null
        "password": null,
        "curMembers": 1,
        "maxMembers": 20,
        "curSongs": 0,
        "maxSongs": 20,
        "updatedAt": "2018-03-05T04:17:00.028Z",
        "createdAt": "2018-03-05T04:17:00.028Z"
    }
}
```

### GET /api/queue/:id
* Allows the member of a queue to retrieve queue information, list of members and the list of songs currently in the queue.
* If user is not a member of the queue or the queue does not exist the response status is `401` and `404` respectively. If user is an admin they can access all queues

**Example Response:**
```
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "owner": 1,
            "name": "Queue 1",
            "maxMembers": 20,
            "maxSongs": 20,
            "private": false,
            "createdAt": "2018-03-03T21:03:04.000Z",
            "updatedAt": "2018-03-03T21:03:04.000Z",
            "Users": [
                {
                    "id": 1,
                    "username": "admin",
                    "first_name": "-",
                    "last_name": "-"
                }
            ],
            "Songs": [
                {
                    "id": 1,
                    "votes": null,
                    "spotifyURI": "queue-1-song-1",
                    "createdAt": "2018-03-03T21:03:04.000Z",
                    "updatedAt": "2018-03-03T21:03:04.000Z",
                    "queueId": 1,
                    "userId": 1
                }
            ]
        }
    ]
}
```

### DELETE /api/queue/:id
* Allows the owner of the queue or an admin to delete a queue. Upon deletion all members are removed and all queued songs are deleted

**Example Response:**
```
{
    "status": "success",
    "data": []
}
```

## Song

### POST /api/queue/:id/songs
* Allows the member of a queue or an admin to add a song to the list.
* If user is not a member of the queue a response status of `401` is returned
* Required Request Body Fields: `spotifyURI`

**Example Response:**
```
{
    "status": "success",
    "data": {
        "id": 6,
        "spotifyURI": "testURI",
        "userId": 1,
        "queueId": 1,
        "updatedAt": "2018-03-05T04:26:34.858Z",
        "createdAt": "2018-03-05T04:26:34.858Z"
    }
}
```

### GET /api/queue/:id/songs
* Allows member of a queue or an admin to retrieve the song list of a given queue using the `:id` parameter
* If user is not a member of the queue a response status of `401` is returned

**Example Response:**
```
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "votes": 0,
            "spotifyURI": "testURI",
            "createdAt": "2018-02-28T00:06:07.000Z",
            "updatedAt": "2018-02-28T00:06:07.000Z",
            "queueId": 2,
            "userId": 2
        }
    ]
}
```

### DELETE /api/queue/:id/songs/:songId
* Allows member of a queue or admin to remove song `:songId` from queue `:id`
* If the queue does not have the song a response status of `404` is returned
* If user is not a member of the queue a response status of `401` is returned

**Example Response:**
```
{
  "status": "success"
}
```

### PUT /api/song/:id/vote
* Allow a member of the queue to upvote a song. If the user is not a member of the song the queue corresponds to then a response status of `401` is returned
* If the song has already been upvoted by the user then the upvote is ignored

**Example Response:**
TODO

### DELETE /api/song/:id/vote
* Allows the user who upvoted a song to retract their upvote.

**Example Response:**
TODO
