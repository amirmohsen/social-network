# Social Network

A sample demo social network web app. This app is not meant to be used in production as it lacks
many security protections such as API rate limiting and has only one test suite with one test in it.
It also lacks React SSR (server-side-rendering) due to time constraints.
It is a proof of concept really more than anything.

This app was originally designed for working with a custom vhost (customizable in the config).
However, to reduce the setup burden, it also runs on localhost with no custom vhost.

## Default Admin User
For easy setup, an admin user is created when the app starts:
email: root@example.com
password: root

In a real-world application, this would be replaced by a cli tool or a config entry
that would create the initial admin user(s) and the subsequent ones would be
created via the ui.

Due to time constraints, this is the shortcut admin user. You can turn any user
to admin by changing the `isAdmin` flag in the database.

The API protects against non-admin users creating an admin user or converting a
non-admin user to one.

## Installation & Usage

After cloning the repo, you have two ways of running the application.

After following either of the following setups, you can access the app on port `5000`. If you have setup
a vhost in your machine's `hosts` file, you can access it directly on the vhost. Default vhost is `socialnetwork.local`.
Otherwise just go to `localhost:5000`. 

### Docker
Ensure you have a recent version of docker installed on your host machine.
The database is not persistent in this docker setup which means on every build, you get a fresh database.

#### Production
Run `docker-compose -f ./docker-compose.prod.yml up --build`

When you see `Listening on port 5000`, browse to `localhost:5000`.

#### Development
Run `docker-compose -f ./docker-compose.dev.yml up --build`

The docker development environment is only there to demonstrate what the build process looks like,
but is not fully functional. The webpack process doesn't recompile on file change and `yarn install` is much
slower. For a true development experience, please follow the **local development** instructions.

#### Tests
Run `docker-compose -f ./docker-compose.test.yml up --build`

There's one test suite here with one test in it. It first starts a production server then runs an API call against the
server. Before each test, it drops the database. Due to lack of time, there's only one test just to demonstrate what
it would be like to test the api rather than provide any meaningful coverage.

### Local (native machine setup)
For local usage, ensure you have the following installed on your machine:

- Node.js 8+
- Yarn 1.3+
- MongoDB 3.4+
- Elastic Search 6.1+

Start MongoDB: `mongod`

Install the dependencies: `yarn install`

Generate the skeleton config: `yarn run config`

Build the builder script: `yarn run build-builder`.
Alternatively, if you plan on making changes to the builder,
you can run `yarn run build-builder-dev` which includes a watch.

#### Production
Build: `yarn run build`
Start the server: `yarn start`

#### Development
Build, watch and start in one command: `yarn run dev`

The above command first does a double server and client build then goes into watch mode and recompiles on file changes.
After the initial compilation, it starts the server. If the server (or shared) files change, it restarts the server using nodemon.

#### Tests
Generate the skeleton config: `yarn run config-test`
By default, the config it generated for a secondary development server that can be run alongside your primary development server.

If you wish to use this secondary development server, run `yarn run test-build`.
If you wish to use your primary development (or production) server,
make changes to the generated config files under the `test/config` folder so they point to it.

Then run the tests, `yarn test`

## App Structure
This is the structure of the `src` directory

- Builder: a flexible, configurable build tool for different environments,
using webpack, babel, nodemon, etc. This is compiled separately using babel-cli.
- Config: run-time Config classes both on the backend and frontend
- Modules: the api handlers and routes (shared to some extent between client and server)
- System: core app functionality
	- Access: Basic access management for the api
		- This is meant to have two different auth methods
			- Human: for accessing the api from the browser with login/logout and cookies
			- Machine: for accessing the api using an authorization header. This was not completed due to time constraints.
	- API: API clients (server and client), API server, API error, API helpers, etc
	- BaseError: base error class for all errors in this app
	- Bootstrap: client and server bootstrap classes
	- DB: class on the server that handles the database connection
	- Logger: helper class on the server for logging
	- Search: basic wrapper that connects and pings Elastic Search
	- WebServer
		- FrontendServer: renders react on the client
		- BackendServer: initializes express middleware and delegates requests to other server classes
		- ContentServer: serves static html (React SSR has been removed due to time constraints)
- UI
 - components: react views
 - data: redux store, action creators and reducers
- client.js: client entry point
- client.vendors.js: client vendors - used to generate a DLL bundle in webpack during dev to improve rebuild times
- server.js: server entry point

## Database Choice
Ideally, I would have liked to use a graph database here such as Neo4j but due to my limited experience with graph databases,
I decided against it. If this were an actual production app, that would be ideal as graph databases are perfect for relationship-driven
data.

Instead, MongoDB is being used here. Mongo is a document database and provides speed and flexibility which are the main
reasons why I chose it here. 

## API Reference

### Users
`/users`

#### Create Users
Open to all (non-admin)

`POST /users`
```json
{
	"firstName": "John",
	"lastName": "Smith",
	"email": "john.smith@example.com",
	"password": "test123"
}
```

#### Edit Users
Open to admin and the user whose record it is

`PUT /users/:id`
```json
{
	"firstName": "Jack"
}
```

#### Get Users
Open to all authenticated users, but the results are limited when the user
is not admin with certain fields such as "connections" stripped out. The `password`
field is hashed (using bcrypt) upon save and is always stripped out regardless of
whether the user is admin or not.

All users
`GET /users`

Available Options:
`GET /users?limit=50&lastId=5a6d242a7954383150589d4f`
`lastId` can be used for paging to skip records
`limit` can be any integer between 1 and 1000. Default: 20

Specific user
`GET /users/:id`

Search for user
`GET /users?search=Smith`
This searches `firstName`, `lastName` and `email` fields

#### Delete Users
Open to admin and the user whose record it is

Delete specific user
`DELETE /users/:id`

Only open to admin

Delete all users
`DELETE /users?all=true`

The `all` option protects against accidental bulk deletion.
`all` can be either true or 1. 

### Connections
While connection references are stored in the user documents, they are not
directly editable via the `/users` api. These api endpoints are for connections:

#### Get Connections
Open to admin and the user whose connections there are

`GET /user/:userId/connections`
The results are automatically resolved i.e. they contain all permitted fields.
No paging or limiting mechanism has been implemented.

#### Create Connections
Open to admin and the user whose connections there are
For the sake of simplicity, connection requesting has not been implemented.

`POST /user/:userId/connections`
```json
{
	"connection": "5a6d242a7954383150589d4f"
}
```
This updates the `connections` array under both users' documents.

#### Delete Connections
Open to admin and the user whose connections there are.

`DELETE /user/:userId/connections/:id`

This updates the `connections` array under both users' documents.