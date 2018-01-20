import webpack from 'webpack';
import postcssImport from 'postcss-import';
import postcssNext from 'postcss-cssnext';
import ExtractTextPlugin from 'extract-text-webpack-plugin';

const getCSSLoader = ({ dev, client, server }) => {
	let cssLoader = {
		loader: `css-loader${server ? '/locals' : ''}`,
		options: {
			modules: true,
			localIdentName: `${dev ? '[path]___[name]__[local]___' : ''}[hash:base64:5]`
		}
	};

	if(client) {
		if(dev) {
			cssLoader.options.sourceMap = true;
		}
		else {
			cssLoader.options.minimize = true;
		}

		cssLoader.options.importLoaders = 1;
	}

	return cssLoader;
};

const getPostCSSLoader = ({root}) => ({
	loader: 'postcss-loader',
	options: {
		parser: 'postcss-scss',
		plugins: () => [
			postcssImport({
				root,
				addDependencyTo: webpack
			}),
			postcssNext()
		]
	}
});

export default config => {
	const {
		root,
		dev,
		client,
		server
	} = config;

	let loaders = [];

	if(client) {
		if(dev) {
			loaders = [
				'style-loader',
				getCSSLoader({ dev, client, server }),
				getPostCSSLoader({ root })
			];
		}
		else {
			loaders = ExtractTextPlugin.extract({
				fallback: 'style-loader',
				use: [
					getCSSLoader({ dev, client, server }),
					getPostCSSLoader({ root })
				]
			});
		}
	}

	if(server) {
		loaders = [
			getCSSLoader({ dev, client, server }),
			getPostCSSLoader({ root })
		];
	}

	return {
		test: /^((?!\.global).)*css$/,
		use: loaders
	};
}