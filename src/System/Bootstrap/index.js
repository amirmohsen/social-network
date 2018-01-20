if(IS_SERVER) {
	module.exports = require('./Bootstrap.server').default;
}
else {
	module.exports = require('./Bootstrap.client').default;
}