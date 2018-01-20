import extend from 'extend';

const sharedConfig = {
	babelrc: false,
	presets: [],
	plugins: [
		'syntax-dynamic-import',
		'syntax-decorators',
		'transform-decorators-legacy',
		'transform-class-properties',
		'transform-export-extensions',
		'transform-object-rest-spread',
		'transform-async-generator-functions'
	]
};

export default config => {
	let {
		dev,
		prod,
		client,
		server,
		alias
	} = config;

	let babelConfig = extend(true, {}, sharedConfig);

	if(server) {
		babelConfig.presets = [
			[
				'env',
				{
					targets: {
						node: 8
					},
					useBuiltIns: true
				}
			],
			'react'
		];
	}

	 if(client) {
		babelConfig.presets = [
			[
				'env',
				{
					modules: false,
					useBuiltIns: true
				}
			],
			'react'
		];

		if(dev) {
			// babelConfig.plugins.unshift('react-hot-loader/babel');
		}
	}

	if(prod) {
		babelConfig.presets.push('react-optimize');
	}

	if(server) {
		alias = alias.server;
	}
	else {
		alias = alias.client;
	}

	babelConfig.plugins.push(
		['module-resolver', {
			alias
		}]
	);

	return babelConfig;
}