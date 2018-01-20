import {createStore, combineReducers, compose, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import {reducer as router, middleware as routerMiddleware} from './Router';
import {reducer as user} from './User';

// In development, connect to the redux browser extension if available
const composeEnhancers = (IS_DEVELOPMENT && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) || compose;

// Building the redux store
const store = createStore(
	combineReducers({
		router,
		user
	}),
	composeEnhancers(
		applyMiddleware(
			thunk,
			routerMiddleware
		)
	)
);

export default store;