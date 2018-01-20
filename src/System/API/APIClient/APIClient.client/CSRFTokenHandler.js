/**
 * Handles fetching new CSRF tokens when the old one has expired.
 * It reattempts the original request three times with new tokens before giving up and failing.
 * In normal circumstances, it should always succeed after the first reattempt.
 * This class is a singleton
 */
export default class CSRFTokenHandler {

	static instance;

	details = {
		token: null,
		requestPromise: null
	};

	/**
	 *
	 * @param apiHandler
	 */
	constructor({apiHandler}) {
		this.apiHandler = apiHandler;
	}

	/**
	 *
	 * @param params
	 * @returns {*}
	 */
	static getInstance(...params) {
		if (!this.instance) {
			this.instance = new CSRFTokenHandler(...params);
		}
		return this.instance;
	}

	/**
	 *
	 * @param returnExisting
	 * @param execRequest
	 * @returns {Promise.<*>}
	 */
	async run({returnExisting = false, execRequest}) {
		const API = this.apiHandler;
		let	token;

		if(returnExisting && this.details.token) {
			return execRequest({
				csrfToken: this.details.token
			});
		}
		else {
			if(this.details.requestPromise && this.details.requestPromise instanceof Promise) {
				token = await this.details.requestPromise;
			}
			else {
				this.details.requestPromise = this.getToken({API});
				token = await this.details.requestPromise;
				this.details = {
					token: token,
					requestPromise: null
				};
			}

			if(token) {
				return execRequest({
					csrfToken: token,
					requestNewCSRFTokenIfInvalid: false
				});
			}
		}
	}

	/**
	 *
	 * @param API
	 * @param remainingAttempts
	 * @returns {Promise.<*>}
	 */
	async getToken({API, remainingAttempts = 3}) {
		let result = await fetch(`/api/csrf-token`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			credentials: 'same-origin'
		});
		result = await result.json();

		if(result.data && result.data.csrfToken) {
			return result.data.csrfToken;
		}

		remainingAttempts--;

		if(remainingAttempts) {
			return this.getToken({API, remainingAttempts});
		}

		return null;
	}
}