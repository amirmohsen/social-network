import Joi from 'joi';
import JoiObjectId from 'joi-objectid';

Joi.objectId = JoiObjectId(Joi);

export default (options = {}) => {
	const {
		includePassword = true
	} = options;

	const keys = {
		email: Joi.string().email().required(),
		firstName: Joi.string().min(1).required(),
		lastName: Joi.string().min(1).required(),
		connections: Joi.array().items(
			Joi.objectId()
		).default([]),
		isAdmin: Joi.boolean().default(false)
	};

	if(includePassword) {
		keys.password = Joi.string().min(3).max(30).required();
	}

	return Joi.object().keys(keys);
};