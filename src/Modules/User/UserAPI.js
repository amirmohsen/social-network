import isInt from 'validator/lib/isInt';
import Joi from 'joi';
import {ObjectID} from 'mongodb';
import DB from 'src/System/DB';
import APIError from '../../System/API/errors/APIError';
import Access from '../../System/Access/Access';
import UserSchema from './UserSchema';
import Search from '../../System/Search/Search';

let instance;

/**
 * API Handler for Users
 */
export default class UserAPI {

	constructor() {
		if(!instance) {
			this.collection = DB.instance.collection('users');
			this.collection.createIndex({
				email: 1
			}, {
				name: 'email',
				unique: true,
				background: true
			});
			this.search = new Search();
			this._setup();
			instance = this;
		}
		return instance;
	}

	async _setup() {
		try {
			if(!(await this.search.client.indices.exists({
					index: 'users'
				}))) {
				await this.search.client.indices.create({
					index: 'users',
					body: {
						mappings: {
							user: {
								properties: {
									firstName: {
										type: 'text'
									},
									lastName: {
										type: 'text'
									},
									email: {
										type: 'text'
									}
								}
							}
						}
					}
				})
			}
		}
		catch(e) {
			console.error(e);
		}
	}

	/**
	 * Create a new user
	 * @param data
	 * @param access
	 * @returns {Promise}
	 */
	async create({data, access}) {
		// connections must be set via their own direct api endpoint;
		delete data.connections;

		let {value, error} = Joi.validate(data, UserSchema());

		if(error) {
			throw new APIError({
				message: 'Invalid data.',
				type: APIError.CODES.BAD_REQUEST,
				details: error.details
			});
		}

		if(value.isAdmin && !access.isAdmin()) {
			throw new APIError({
				message: 'You cannot create an admin user.',
				type: APIError.CODES.UNAUTHORIZED
			});
		}

		value = {
			...value,
			password: await Access.hash(value.password),
			creationDateTime: new Date(),
			modificationDateTime: new Date()
		};

		let document;

		try {
			let	{insertedId} = await this.collection.insertOne(value);

			document = await this.collection.findOne({
				_id: insertedId
			});

			await this.search.client.index({
				index: 'users',
				type: 'user',
				id: document._id.toString(),
				body: {
					firstName: document.firstName,
					lastName: document.lastName,
					email: document.email
				}
			});
		}
		catch(error) {
			console.error(error);

			document = await this.collection.findOne({
				email: value.email
			});

			if(document) {
				throw new APIError({
					message: 'A user with that email already exists.',
					type: APIError.CODES.BAD_REQUEST
				});
			}

			throw new APIError({
				message: 'User creation failed.',
				type: APIError.CODES.INTERNAL_ERROR
			});
		}

		return this._processData({document});
	}

	/**
	 * Update the user
	 * @param params
	 * @param data
	 * @param access
	 * @returns {Promise}
	 */
	async update({params, data, access}) {
		if(typeof params.id !== 'string' && !ObjectID.isValid(params.id)) {
			throw new APIError({
				message: 'Invalid id provided',
				type: APIError.CODES.BAD_REQUEST
			});
		}

		access.checkAuthenticated();

		let _id = new ObjectID(params.id);

		let currentDoc = await this.collection.findOne({
			_id
		});

		if(!currentDoc) {
			throw new APIError({
				message: 'No user with such an id exists.',
				type: APIError.CODES.NOT_FOUND
			});
		}

		let mergedData = {
			...currentDoc,
			...data
		};

		// connections must be set via their own direct api endpoint;
		delete mergedData.connections;
		delete mergedData._id;
		delete mergedData.creationDateTime;
		delete mergedData.modificationDateTime;

		let includePassword = true;

		if(!data.password) {
			includePassword = false;
			delete mergedData.password;
		}

		let {value, error} = Joi.validate(mergedData, UserSchema({includePassword}));

		if(error) {
			throw new APIError({
				message: 'Invalid data.',
				type: APIError.CODES.BAD_REQUEST,
				details: error.details
			});
		}

		if(!access.isAdmin() && !(access.isHuman() && access.isCurrentUser(params.id))) {
			access.throwAuthError();
		}

		if((value.isAdmin && !currentDoc.isAdmin) || (!value.isAdmin && currentDoc.isAdmin)) {
			access.checkAdmin();
			throw new APIError({
				message: 'You cannot give or take away admin access.',
				type: APIError.CODES.UNAUTHORIZED
			});
		}

		value = {
			...value,
			creationDateTime: currentDoc.creationDateTime,
			modificationDateTime: new Date()
		};

		let plainPassword;

		if(value.password) {
			plainPassword = value.password;
			value.password = await Access.hash(value.password);
		}

		let document;

		try {
			await this.collection.updateOne({
				_id
			}, {
				$set: value
			});

			document = await this.collection.findOne({
				_id
			});

			await this.search.client.index({
				index: 'users',
				type: 'user',
				id: document._id.toString(),
				body: {
					firstName: document.firstName,
					lastName: document.lastName,
					email: document.email
				}
			});

			// log them in again automatically to avoid having to login again after updating password
			if(plainPassword && access.isHuman() && access.isCurrentUser(params.id)) {
				await access.login({
					email: document.email,
					password: plainPassword
				});
			}
		}
		catch(error) {
			console.error(error);

			document = await this.collection.findOne({
				email: value.email
			});

			if(document) {
				throw new APIError({
					message: 'A user with that email already exists.',
					type: APIError.CODES.BAD_REQUEST
				});
			}

			throw new APIError({
				message: 'User update failed.',
				type: APIError.CODES.INTERNAL_ERROR
			});
		}

		return this._processData({document, access});
	}

	/**
	 * Read users by id or in bulk
	 * Options are used for reading in bulk
	 * @param params
	 * @param options
	 * @param access
	 * @param responseMeta
	 * @returns {Promise}
	 */
	async read({params, options, access, responseMeta}) {
		let {
			lastId,
			limit = 20,
			search = ''
		} = options;

		access.checkAuthenticated();

		if(params.id) {
			if(typeof params.id !== 'string' && !ObjectID.isValid(params.id)) {
				throw new APIError({
					message: 'Invalid id provided.',
					type: APIError.CODES.BAD_REQUEST
				});
			}

			let document = await this.collection.findOne({
				_id: new ObjectID(params.id)
			});

			if(document) {
				return this._processData({document, access});
			}

			throw new APIError({
				message: 'No user with such an id exists.',
				type: APIError.CODES.NOT_FOUND
			});
		}

		if(search) {
			let searchResult = await this.search.client.search({
				index: 'users',
				body: {
					query: {
						function_score: {
							query: {
								multi_match: {
									query: search,
									fields: [
										'firstName',
										'lastName',
										'email'
									],
									fuzziness: 'AUTO',
									prefix_length: 2
								}
							}
						}
					}
				}
			});

			let ids = searchResult.hits.hits.map(doc => new ObjectID(doc._id));

			if(!ids.length) {
				return [];
			}

			let items = await this.collection
				.find({
					_id: {
						$in: ids
					}
				})
				.map(document => this._processData({document, access}))
				.toArray();

			return ids.reduce((ordered, id) => {
				let item = items.find(doc => doc._id.equals(id));

				if(item) {
					ordered.push(item);
				}

				return ordered;
			}, []);
		}

		let query = {};

		if(lastId) {
			if(typeof lastId !== 'string' && !ObjectID.isValid(lastId)) {
				throw new APIError({
					message: 'Invalid id provided for the last fetched id.',
					type: APIError.CODES.BAD_REQUEST
				});
			}

			query = {
				...query,
				_id: {
					$lt: new ObjectID(lastId)
				}
			};
		}

		if(typeof limit === 'string' && isInt(limit, {min: 1, max: 1000})) {
			limit = Number.parseInt(limit);
		}
		else if(!Number.isInteger(limit) || (Number.isInteger(limit) && limit < 1 && limit > 1000)) {
			throw new APIError({
				message: 'Limit option must be an integer (number or string) between 1 and 1000.',
				type: APIError.CODES.BAD_REQUEST
			});
		}

		let items = await this.collection.find(query)
			.sort({
				creationDateTime: -1
			})
			.limit(limit + 1) // One more to know if we have more records
			.map(document => this._processData({document, access}))
			.toArray();

		if(items.length === limit + 1) {
			responseMeta.hasMore = true;
			items = items.slice(0, items.length - 1);
		}
		else {
			responseMeta.hasMore = false;
		}

		return items;
	}

	/**
	 * Get current user
	 * @param access
	 */
	current({access}) {
		access.checkAuthenticated() && access.checkHuman();
		return this._processData({document: access.user, access});
	}

	/**
	 * Deletes users by id or in bulk
	 * @param params
	 * @param options
	 * @param access
	 * @returns {Promise}
	 */
	async remove({params, options, access}) {
		let {
			all = false
		} = options;

		if(typeof all === 'string') {
			all = all.toLowerCase();
		}

		all = ['true', '1', 1, true].includes(all);

		access.checkAuthenticated();

		if(params.id !== undefined) {
			if(typeof params.id !== 'string' && !ObjectID.isValid(params.id)) {
				throw new APIError({
					message: 'Invalid id provided.',
					type: APIError.CODES.BAD_REQUEST
				});
			}

			if(!access.isAdmin() && (access.isHuman() && !access.isCurrentUser(params.id))) {
				access.throwAuthError();
			}

			let _id = new ObjectID(params.id);

			let {deletedCount} = await this.collection.deleteOne({
				_id
			});

			await this.search.client.delete({
				index: 'users',
				type: 'user',
				id: _id.toString()
			});

			if(deletedCount) {
				return {
					deletedId: params.id
				}
			}

			let document = await this.collection.findOne({
				_id
			});

			if(!document) {
				throw new APIError({
					message: 'No user with such id exists.',
					type: APIError.CODES.NOT_FOUND
				});
			}

			throw new APIError({
				message: 'User deletion failed.',
				type: APIError.CODES.INTERNAL_ERROR
			});
		}

		access.checkAdmin();

		if(!all) {
			throw new APIError({
				message: 'You have to provide the "all" option to delete all users.',
				type: APIError.CODES.BAD_REQUEST
			});
		}

		let {deletedCount} = await this.collection.deleteMany({});

		await this.search.client.deleteByQuery({
			index: 'users',
			type: 'user',
			body: {
				query: {
					match_all: {}
				}
			}
		});

		return {
			deletedCount
		};
	}

	/**
	 * Login the user
	 * @param data
	 * @param access
	 * @returns {*|Promise<*>}
	 */
	async login({data, access}) {
		!access.isAuthenticated() && access.checkHuman();
		return this._processData({
			document: await access.login(data),
			access
		});
	}

	/**
	 * Logout the user
	 * @param access
	 * @returns {*|Promise|void}
	 */
	logout({access}) {
		access.checkAuthenticated() &&	access.checkHuman();
		return access.logout();
	}

	_processData({document, access = null}) {
		delete document.password;

		if(access && !access.isAdmin() && !access.isCurrentUser(document._id)) {
			for(const key of ['email', 'connections', 'isAdmin', 'creationDateTime', 'modificationDateTime']) {
				delete document[key];
			}
		}

		return document;
	}
}