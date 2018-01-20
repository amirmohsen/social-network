if(IS_SERVER) {
	module.exports = {
		APIHandler: require('./UserAPI').default
	};
}
else {
	module.exports = {
		APIHandler: null
	};
}