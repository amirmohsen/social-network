import {resolve} from 'path';
import extend from 'extend';
import nodemon from 'nodemon';
import ServerCompiler from './compilers/ServerCompiler';
import ClientCompiler from './compilers/ClientCompiler';

/**
 * Entry point class to the build process
 */
export default class Loader {

	static settings = {
		root: '',
		dev: false,
		library: false,
		define: {},
		start: '',
		sources: {}
	};

	/**
	 *
	 * @param config
	 */
	constructor(config) {
		this.config = extend(true, {}, Loader.settings, {prod: !config.dev, watch: config.dev}, config);
		// TODO: validate config
		if(this.config.sources.server) {
			this.serverCompiler = new ServerCompiler({
				...this.config,
				server: true,
				client: false
			});
		}

		if(this.config.sources.client) {
			this.clientCompiler = new ClientCompiler({
				...this.config,
				server: false,
				client: true
			});
		}
	}

	/**
	 * Starts compilation
	 * @returns {Promise.<*[]>}
	 */
	build() {
		const promiseList = [];

		if(this.config.sources.server) {
			promiseList.push(this.serverCompiler.build({restart: this.restart}));
		}

		if(this.config.sources.client) {
			promiseList.push(this.clientCompiler.build());
		}

		return Promise.all(promiseList);
	}

	/**
	 * Starts the server during development
	 */
	start() {
		if(!this.config.sources.server || !this.config.start) {
			return;
		}

		let command = 'node';

		if(this.config.runServerWithInspect) {
			command += ' --inspect';
		}

		nodemon({
			script: resolve(this.config.root, this.config.start),
			exec: command,
			ignore: ['*'],
			watch: ['ThisIsAFakeDirToDisableNodemonWatch/'],
			ext: 'noop',
			verbose: true
		})
			.on('log', ({colour: colorCodedLog}) => console.log(colorCodedLog));
	}

	/**
	 * Restarts the server during development on file change
	 */
	restart = () => {
		if(!this.config.sources.server || !this.config.start) {
			return;
		}

		nodemon.restart();
	};
}