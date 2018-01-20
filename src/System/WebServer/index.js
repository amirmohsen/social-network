if(IS_SERVER) {
	module.exports = require('./server/BackendServer').default;
}
else {
	module.exports = require('./client/FrontendServer').default;
}