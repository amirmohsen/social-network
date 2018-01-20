import SharedAPIClient from './APIClient.shared';

/**
 * Server-specific API Client extending the base class
 */
export default class APIClient extends SharedAPIClient {

	/**
	 *
	 * @param instance
	 * @param args
	 */
	constructor({instance, ...args}) {
		super(args);
		this.instance = instance;
	}

	/**
	 *
	 * @returns {*}
	 * @private
	 */
	_exec() {
		const {
			action,
			...request
		} = this.request;

		return this.instance[action](request);
	}
}