import webpack from 'webpack';
import webpackConfig from '../webpack/config';

/**
 * Server code compiler
 */
export default class ServerCompiler {

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
	 * Uses webpack watch for development
	 * @param restart
	 * @returns {Promise}
	 */
	build({restart}) {
		return new Promise(resolve => {
			if(this.config.dev) {
				this.compiler.watch({
					aggregateTimeout: 300,
					poll: true
				}, (...args) => this.onCompilationDone(...args, resolve, restart));
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
	 * @param restart
	 */
	onCompilationDone(err, stats, resolve, restart = false) {
		if (err) {
			console.error(err.stack || err);
			if (err.details) {
				console.error(err.details);
			}
			return;
		}

		console.log(stats.toString({
			chunks: false,  // Makes the build much quieter
			colors: true    // Shows colors in the console
		}));

		if(this.initialCompilationComplete) {
			if(restart) {
				restart();
			}
		}
		else {
			this.initialCompilationComplete = true;
			resolve();
		}
	}
}