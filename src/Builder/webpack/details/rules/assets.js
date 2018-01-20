export default config => {
	const {
		dev,
		prod,
		server
	} = config;

	const options = {
		limit: 5000
	};

	if(dev) {
		options.name = '[name]-[hash].[ext]';
	}

	if(prod) {
		options.name = '[hash].[ext]';
	}

	if(server) {
		options.emitFile = false;
	}

	return {
		test: /\.(eot|woff|woff2|ttf|otf|gif|svg|png|jpe?g)(\?\S+)?$/,
		loader: {
			loader: 'url-loader',
			options
		}
	};
}