import {writeFile} from 'fs-extra';
import stringify from 'json-stringify-safe';
import {inspect} from 'util';
import Config from '../../Config/Config.server';

/**
 * Logging utilities
 */
export default class Logger {

	/**
	 * It catches unhandled promise rejections in the application and throws them as errors
	 */
	static init() {
		process.on('unhandledRejection', (reason, p) => { throw reason });
	}

	/**
	 * Logs objects with colors and depth
	 * @param value
	 * @param options
	 */
	static log(value, options = {}) {
		console.log(inspect(value, {
			depth: null,
			colors: true,
			...options
		}));
	}

	/**
	 * Logs values into files
	 * @param value
	 * @param options
	 * @returns {*}
	 */
	static flog(value, options = {}) {
		const {
			filename = 'debug.json',
			jsonify = true
		} = options;

		return writeFile(`${Config.dirs.logs}/${filename}`, jsonify ? stringify(value) : value);
	}
}