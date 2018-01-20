import {set, assign} from 'object-path-immutable';
import API from '../../System/API';

export default class UserActions {

	static data = {
		query: '',
		search: [],
		users: {},
		loading: false,
		current: null,
		showRegisterForm: false
	};

	static reset() {
		return {
			type: 'User.reset'
		};
	}

	static current() {
		return async dispatch => {
			let {data} = await API.users.current();
			if(data) {
				dispatch(this.set({
					path: 'current',
					value: data
				}));
			}
		};
	}

	static getUser({id}) {
		return async (dispatch, getState) => {
			let users = getState().user.users;

			if(users[id]) {
				return;
			}

			let {data} = await API.users.read({
				params: {
					id
				}
			});

			if(data) {
				dispatch(this.assign({
					path: 'users',
					value: {
						[id]: data
					}
				}));
			}
		};
	}

	static loadConnections({userId}) {
		return async (dispatch, getState) => {
			let {data} = await API
				.users
				.connections
				.read({
					params: {
						userId
					}
				});

			if(data) {
				if(userId === getState().user.current._id) {
					dispatch(this.set({
						path: 'current.connections',
						value: data
					}));
				}
				else {
					dispatch(this.set({
						path: `users.${userId}.connections`,
						value: data
					}));
				}
			}
		};
	}

	static connect({userId, connectionId}) {
		return async dispatch => {
			let {data} = await API
				.users
				.connections
				.create({
					params: {
						userId
					},
					data: {
						connection: connectionId
					}
				});

			if(data) {
				dispatch(this.loadConnections({userId}));
			}
		};
	}

	static disconnect({userId, connectionId}) {
		return async dispatch => {
			let {data} = await API
				.users
				.connections
				.remove({
					params: {
						userId,
						id: connectionId
					}
				});

			if(data) {
				dispatch(this.loadConnections({userId}));
			}
		};
	}

	static query({query}) {
		return this.set({
			path: 'query',
			value: query
		});
	}

	static search({query}) {
		return async (dispatch, getState) => {
			if(!query) {
				return dispatch(this.set({
					path: 'search',
					value: []
				}));
			}

			let {data} = await API.users.read({
				options: {
					search: query
				}
			});

			if(data) {
				let
					items = data.filter(item => item._id !== getState().user.current._id),
					users = items.reduce((reduced, item) => ({
						...reduced,
						[item._id]: item
					}), {});

				dispatch(this.assign({
					path: 'users',
					value: users
				}));

				dispatch(this.set({
					path: 'search',
					value: items.map(item => item._id)
				}));
			}
		};
	}

	static update({id, data}) {
		return async dispatch => {
			let {data: resultData, error} = await API.users.update({
				params: {
					id
				},
				data
			});

			if(resultData) {
				dispatch(this.set({
					path: 'current',
					value: resultData
				}));
			}
			else if(error) {
				return error.message;
			}
		};
	}

	static register({email, password, firstName, lastName}) {
		return async dispatch => {
			let {data, error} = await API.users.create({
				data: {
					email,
					password,
					firstName,
					lastName
				}
			});

			if(data) {
				dispatch(this.login({email, password}));
			}
			else if(error) {
				return 'Registration failed';
			}
		};
	}

	static login({email, password}) {
		return async dispatch => {
			let {data, error} = await API.users.login({
				data: {
					email,
					password
				}
			});

			if(data) {
				dispatch(this.set({
					path: 'current',
					value: data
				}));
			}
			else if(error) {
				if(error.details.invalidEmail) {
					dispatch(this.showRegisterForm())
				}
				else if(error.details.invalidPassword) {
					return 'Wrong password';
				}
				else {
					return 'Login failed';
				}
			}
		};
	}

	static logout() {
		return async dispatch => {
			let {data} = await API.users.logout();

			if(data) {
				dispatch(this.reset());
			}
		};
	}

	static showRegisterForm() {
		return this.set({
			path: 'showRegisterForm',
			value: true
		});
	}

	static hideRegisterForm() {
		return this.set({
			path: 'showRegisterForm',
			value: false
		});
	}

	static set({path, value}) {
		return {
			type: 'User.set',
			payload: {
				path,
				value
			}
		};
	}

	static assign({path, value}) {
		return {
			type: 'User.assign',
			payload: {
				path,
				value
			}
		};
	}

	static reducer(state = UserActions.data, action) {
		switch(action.type) {
			case 'User.set':
				return set(state, action.payload.path, action.payload.value);
			case 'User.assign':
				return assign(state, action.payload.path, action.payload.value);
			case 'User.reset':
				return UserActions.data;
			default:
				return state;
		}
	}
}

export const reducer = UserActions.reducer.bind(this);