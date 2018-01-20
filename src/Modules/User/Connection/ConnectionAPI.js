import {ObjectID} from 'mongodb';
import DB from '../../../System/DB';
import API from '../../../System/API';
import APIError from '../../../System/API/errors/APIError';

let instance;

export default class ConnectionAPI {

	constructor() {
		if(!instance) {
			this.userCollection = DB.instance.collection('users');
			instance = this;
		}
		return instance;
	}

	async read({req, res, access, params}) {
		if(!access.isAdmin() && !(access.isHuman() && access.isCurrentUser(params.userId))) {
			access.throwAuthError();
		}

		let
			userId = params.userId,
			{data: user} = await API
				.users
				.read({
					req,
					res,
					params: {
						id: userId
					}
				});

		let connections = await Promise.all(
			user.connections.map(connection => (
				API
					.users
					.read({
						req,
						res,
						params: {
							id: connection
						}
					})
			))
		);

		return connections.map(connection => connection.data);
	}

	async create({access, params, data}) {
		if(typeof params.userId !== 'string' && !ObjectID.isValid(params.userId)) {
			throw new APIError({
				message: 'Invalid user id provided.',
				type: APIError.CODES.BAD_REQUEST
			});
		}

		if(typeof data.connection !== 'string' && !ObjectID.isValid(data.connection)) {
			throw new APIError({
				message: 'Invalid connection id provided.',
				type: APIError.CODES.BAD_REQUEST
			});
		}

		if(!access.isAdmin() && !(access.isHuman() && access.isCurrentUser(params.userId))) {
			access.throwAuthError();
		}

		let
			userId = new ObjectID(params.userId),
			connectionId = new ObjectID(data.connection);

		await this.userCollection.updateOne({
			_id: userId
		}, {
			$addToSet: {
				connections: connectionId
			},
			$set: {
				modificationDateTime: new Date()
			}
		});

		await this.userCollection.updateOne({
			_id: connectionId
		}, {
			$addToSet: {
				connections: userId
			},
			$set: {
				modificationDateTime: new Date()
			}
		});

		return {};
	}

	async remove({access, params}) {
		if(typeof params.userId !== 'string' && !ObjectID.isValid(params.userId)) {
			throw new APIError({
				message: 'Invalid user id provided.',
				type: APIError.CODES.BAD_REQUEST
			});
		}

		if(typeof params.id !== 'string' && !ObjectID.isValid(params.id)) {
			throw new APIError({
				message: 'Invalid connection id provided.',
				type: APIError.CODES.BAD_REQUEST
			});
		}

		let
			userId = new ObjectID(params.userId),
			connectionId = new ObjectID(params.id);

		if(!access.isAdmin() && !(access.isHuman() && access.isCurrentUser(params.userId))) {
			access.throwAuthError();
		}

		await this.userCollection.updateOne({
			_id: userId
		}, {
			$pull: {
				connections: connectionId
			},
			$set: {
				modificationDateTime: new Date()
			}
		});

		await this.userCollection.updateOne({
			_id: connectionId
		}, {
			$pull: {
				connections: userId
			},
			$set: {
				modificationDateTime: new Date()
			}
		});

		return {};
	}
}