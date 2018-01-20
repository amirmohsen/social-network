if(IS_SERVER) {
	module.exports = require('./Config.server').default;
}
else {
	module.exports = require('./Config.client').default;
}