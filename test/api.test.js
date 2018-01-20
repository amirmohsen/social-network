import 'isomorphic-fetch';
import {stringify as queryStringify} from 'qs';
import extend from 'extend';
import {ObjectID} from 'mongodb';
import sharedConfig from './config/shared.json';
import './utils/setupDB';

const fetchData = async (path, options = {}) => {
	options = extend(true, {
		headers: {
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		credentials: 'include',
	}, options);

	let response = await fetch(
		new Request(`http://api.${sharedConfig.domain}:${sharedConfig.port}${path}`, options)
	);

	let json = await response.json();

	return {
		response,
		json
	};
};

describe('User API:', () => {

	test('Create User', async () => {
		let {response, json} = await fetchData('/users', {
			method: 'POST',
			body: JSON.stringify({
				firstName: "John",
				lastName: "Smith",
				email: "john@example.com",
				password: "test123"
			})
		});

		let {data} = json;

		expect(response.status).toBe(200);
		expect(data).toMatchObject({
			firstName: "John",
			lastName: "Smith",
			email: "john@example.com"
		});
		expect(ObjectID.isValid(data._id)).toBe(true);
		expect(data.password === undefined).toBe(true);
	});
});