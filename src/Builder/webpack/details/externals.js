import nodeExternals from 'webpack-node-externals';

export default config => {
	let {
		server,
		library
	} = config;

	if(server || library) {
		return nodeExternals();
	}

	return [];
}