import babel from '../babel';

export default config => {
	return {
		test: /\.jsx?$/,
		exclude: /node_modules/,
		loader: {
			loader: 'babel-loader',
			options: babel(config)
		}
	};
}