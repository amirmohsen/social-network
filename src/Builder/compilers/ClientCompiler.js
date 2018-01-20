import {resolve as pathResolve} from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import webpackConfig from '../webpack/config';

/**
 * Client code compiler
 */
export default class ClientCompiler {

	/**
	 *
	 * @param config
	 */
	constructor(config) {
		this.config = config;
		this.webpackConfig = webpackConfig(this.config);
		this.compiler = webpack(this.webpackConfig);
		this.initialCompilationComplete = false;
	}

	/**
	 * In development, it uses the webpack dev server
	 * In production, it uses webpack directly
	 * For libs, it uses webpack directly
	 * @returns {Promise}
	 */
	build() {
		return new Promise(async resolve => {
			if(this.config.dev) {
				if(this.config.library) {
					this.compiler.watch({
						aggregateTimeout: 300,
						poll: true
					}, (...args) => this.onCompilationDone(...args, resolve));
				}
				else {
					this.compiler.plugin('done', stats => this.onCompilationDone(null, stats, resolve));
					(new WebpackDevServer(this.compiler, {
						compress: true,
						historyApiFallback: true,
						hot: true,
						noInfo: true,
						publicPath: `http://localhost:${this.config.devServerPort}/`,
						contentBase: pathResolve(this.config.root, 'dist/client'),
						stats: {
							colors: true
						},
						headers: {
							'Access-Control-Allow-Origin': '*',
							'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
							'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization'
						}
					})).listen(this.config.devServerPort);
				}
			}
			else {
				this.compiler.run((...args) => this.onCompilationDone(...args, resolve));
			}
		});
	}

	/**
	 * Outputs a message on each compilation
	 * Resolves a promise after the first compilation
	 * @param err
	 * @param stats
	 * @param resolve
	 */
	onCompilationDone(err, stats, resolve) {
		if(err) {
			console.error(err.stack || err);
			if(err.details) {
				console.error(err.details);
			}
			return;
		}

		console.log(stats.toString({
			chunks: false,
			colors: true
		}));

		if(!this.initialCompilationComplete) {
			this.initialCompilationComplete = true;
			resolve();
		}
	}
}