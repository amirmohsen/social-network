export default config => {
	let {
		server
	} = config;

	if(server) {
		return {
			console: true,
			global: true,
			process: true,
			Buffer: true,
			__filename: true,
			__dirname: true,
			setImmediate: true
		};
	}

	return {};
}