import extend from 'extend';

export default config => {
	let {
		dev,
		prod,
		client,
		server,
		library,
		sources,
		devServerPort
	} = config;

	let entries = {};

	if(server) {
		entries = sources.server;
	}

	if(client) {
		if(dev && !library) {
			for(const name in sources.client) {
				const entry = sources.client[name];

				entries[name] = [
					// 'react-hot-loader/patch',
					// activate HMR for React

					`webpack-dev-server/client?http://localhost:${devServerPort}`,
					// bundle the client for webpack-dev-server
					// and connect to the provided endpoint

					'webpack/hot/dev-server',

					// 'webpack/hot/only-dev-server',
					// bundle the client for hot reloading
					// only- means to only hot reload for successful updates
				];

				if(Array.isArray(entry)) {
					entries[name] = [
						...entries[name],
						...entry
					]
				}
				else {
					entries[name].push(entry);
				}
			}
		}

		if(prod || library) {
			entries = extend(true, {}, sources.client);
		}
	}

	return entries;
}