import JWT from 'jsonwebtoken';
import * as Authorization from 'auth-header';
import Crypto from 'crypto-js';
import {hash, compare} from 'bcrypt';
import {ObjectID} from 'mongodb';
import Config from '../../Config';
import APIError from '../API/errors/APIError';
import DB from '../DB';

export default class Access {

	static DEFAULT_EXPIRY = 86400; // Expires in 24 hours

	static SALT_ROUNDS = 10;

	req;
	user;
	app;

	constructor(req = null) {
		this.req = req;
		this.collection = DB.instance.collection('users');
	}

	async setup() {
		if(!this.req) {
			return;
		}

		let token;

		if(this.isApp()) {
			try {
				let auth = Authorization.parse(this.req.get('authorization'));

				if(auth.scheme === 'Bearer') {
					token = auth.token;
				}
			}
			catch(e) {}
		}
		else {
			token = this.req.session.authToken;
		}

		if(token) {
			const decodedToken = await this._verify(token);

			if(this.isApp()) {
				// TODO: set app
			}
			else {
				this.user = await this._getUserByToken(decodedToken);
			}
		}
	}

	isApp() {
		return !this.req || this.req.internalAppVars.apiAccessType === 'app';
	}

	isHuman() {
		return this.req && this.req.internalAppVars.apiAccessType === 'human';
	}

	isAuthenticated() {
		return !this.req || this.user || this.app;
	}

	isAdmin() {
		return !this.req || this.app || (this.user && this.user.isAdmin);
	}

	isCurrentUser(id) {
		return this.user && this.user._id.toString() === id.toString();
	}

	checkApp() {
		if(this.isApp()) {
			return;
		}

		this.throwAuthError();
	}

	checkHuman() {
		if(this.isHuman()) {
			return;
		}

		this.throwAuthError();
	}

	checkAuthenticated() {
		if(this.isAuthenticated()) {
			return;
		}

		this.throwAuthError();
	}

	checkAdmin() {
		if(this.isAdmin()) {
			return;
		}

		this.throwAuthError();
	}

	checkCurrentUser(id) {
		if(this.isCurrentUser(id)) {
			return;
		}

		this.throwAuthError();
	}

	throwAuthError() {
		throw new APIError({
			type: APIError.CODES.UNAUTHORIZED,
			message: 'Unauthorized access.'
		});
	}

	async login({email, password}) {
		let doc = await this.collection.findOne({ 'email': email });

		if(!doc) {
			this._failedLogin({
				invalidEmail: true
			});
		}

		let savedPassword = doc.password;

		try {
			let valid = await compare(password, savedPassword);

			if(valid) {
				this.req.session.authToken = this._sign({
					payload: {
						userId: doc._id,
						signature: Crypto.AES.encrypt(savedPassword, Config.secret).toString()
					}
				});

				this.user = doc;

				return this.user;
			}
		}
		catch(error) {}

		this._failedLogin({
			invalidPassword: true
		});
	}

	logout() {
		if(this.req.session.authToken) {
			return new Promise(resolve => this.req.session.regenerate(err => {
				if(err) {
					throw new APIError({
						type: APIError.CODES.INTERNAL_ERROR,
						message: 'Session destruction error.'
					});
				}
				else {
					resolve({});
				}
			}));
		}

		throw new APIError({
			type: APIError.CODES.BAD_REQUEST,
			message: 'No user is logged in.'
		});
	}

	_failedLogin(details) {
		throw new APIError({
			type: APIError.CODES.BAD_REQUEST,
			message: 'Authentication failed.',
			details
		});
	}

	_sign({payload, exp = Access.DEFAULT_EXPIRY}) {
		const options = {};

		if(exp) {
			options.expiresIn = exp;
		}

		return JWT.sign(payload, Config.secret, options);
	}

	_verify(token) {
		return new Promise(async resolve => {
			JWT.verify(token, Config.secret, (err, decoded) => {
				if (err) {
					throw new APIError({
						type: APIError.CODES.UNAUTHORIZED,
						message: 'Authorization token verification failed. Please authenticate again.',
						details: {
							expiredAuthToken: true
						}
					});
				} else {
					resolve(decoded);
				}
			});
		});
	}

	async _getUserByToken({userId, signature}) {
		let doc = await this.collection.findOne({ _id: new ObjectID(userId) });

		if(doc.password !== Crypto.AES.decrypt(signature, Config.secret).toString(Crypto.enc.Utf8)) {
			// Password has changed. The user has to login again.
			return;
		}

		return doc;
	}

	static hash(password) {
		return hash(password, this.SALT_ROUNDS);
	}
}