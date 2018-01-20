process.on('unhandledRejection', (reason, p) => { throw reason });

require('babel-polyfill');

const
	loader = require('./dist/builder').default,
	resolve = require('path').resolve,
	argv = require('yargs').argv,
	devConfig = require('./config/dev.json'),
	isDev = !!argv.dev,
	build = async () => {
		if(isDev) {
			await loader(Object.assign({}, {
				root: __dirname,
				dev: isDev,
				library: 'webpackVendorDLL',
				dll: true,
				sources: {
					client: {
						vendor: [resolve(__dirname, 'src/client.vendors.js')]
					}
				},
				output: {
					client: 'dist/client'
				},
				configDir: resolve(__dirname, 'config')
			}, devConfig));
		}

		loader(Object.assign({}, {
			root: __dirname,
			dev: isDev,
			start: isDev ? 'dist/server/server' : '',
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
				server: 'dist/server',
				client: 'dist/client'
			},
			runServerWithInspect: true,
			configDir: resolve(__dirname, 'config')
		}, devConfig));
	};

build();
