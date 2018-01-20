export default config => {
	let {
		server
	} = config;

	if(server) {
		return 'node';
	}

	return 'web';
}