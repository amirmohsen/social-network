process.on('unhandledRejection', (reason, p) => { throw reason });

require('babel-polyfill');

const
	loader = require('../dist/builder').default,
	resolve = require('path').resolve,
	devConfig = require('./config/dev.json'),
	isDev = true,
	root = resolve(__dirname, '../'),
	build = async () => {
		if(isDev) {
			await loader(Object.assign({}, {
				root,
				dev: isDev,
				library: 'webpackVendorDLL',
				dll: true,
				sources: {
					client: {
						vendor: [resolve(root, 'src/client.vendors.js')]
					}
				},
				output: {
					client: 'dist/test/client'
				},
				configDir: resolve(__dirname, 'config')
			}, devConfig));
		}

		return loader(Object.assign({}, {
			root,
			dev: isDev,
			start: isDev ? 'dist/test/server/server' : '',
			useDll: isDev ? 'webpackVendorDLL' : '',
			sources: {
				server: {
					server: './src/server'
				},
				client: {
					client: './src/client'
				}
			},
			output: {
				server: 'dist/test/server',
				client: 'dist/test/client'
			},
			configDir: resolve(__dirname, 'config')
		}, devConfig));
	};

build();
