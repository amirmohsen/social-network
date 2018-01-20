import Tokens from 'csrf';
import JWT from 'jsonwebtoken';
import Config from 'src/Config';

/**
 * Generating and verifying CSRF tokens
 */
export default class CSRFTokenManager {

	static tokens = new Tokens();

	/**
	 * Generate CSRF tokens
	 * @param req
	 * @returns {Promise.<*>}
	 */
	static async generate({req}) {
		if(!req.session.csrfSecret) {
			req.session.csrfSecret = await this.tokens.secret();
			req.session.save();
		}

		return JWT.sign({
			csrfToken: this.tokens.create(req.session.csrfSecret)
		}, Config.secret, {
			expiresIn: 60 * 60 // 1 hour
		});
	}

	/**
	 * Validate CSRF tokens
	 * @param req
	 * @returns {Promise.<*>}
	 */
	static async verify({req}) {
		let
			verified = false,
			token = req.headers['csrf-token'];

		if(!token) {
			return verified;
		}

		return new Promise(resolve => {
			JWT.verify(token, Config.secret, (err, decoded) => {
				if(!err && decoded && decoded.csrfToken && req.session.csrfSecret) {
					verified = this.tokens.verify(req.session.csrfSecret, decoded.csrfToken);
				}
				resolve(verified);
			});
		});
	}
}