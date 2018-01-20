if(IS_SERVER) {
	module.exports = {
		APIHandler: require('./ConnectionAPI').default
	};
}
else {
	module.exports = {
		APIHandler: null
	};
}