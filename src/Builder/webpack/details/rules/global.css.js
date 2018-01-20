import ExtractTextPlugin from 'extract-text-webpack-plugin';

export default config => {
	const {
		dev,
		prod,
		client,
		server
	} = config;

	let loaders = [];

	if(client) {
		if(dev) {
			loaders = [
				'style-loader',
				{
					loader: 'css-loader',
					options: {
						sourceMap: true,
						importLoaders: 1
					}
				}
			];
		}

		if(prod) {
			loaders = ExtractTextPlugin.extract({
				fallback: 'style-loader',
				use: [
					{
						loader: 'css-loader',
						options: {
							minimize: true,
							importLoaders: 1
						}
					}
				]
			});
		}
	}

	if(server) {
		loaders = [
			'css-loader/locals'
		];
	}

	return {
		test: /\.global\.css$/,
		use: loaders
	};
}