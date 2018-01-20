if(IS_SERVER) {
	module.exports = require('./APIClient.server').default;
}
else {
	module.exports = require('./APIClient.client/APIClient.client').default;
}