import React, {Component} from 'react';
import {Provider} from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import {history} from './data/Router';
import store from './data/store';
import Main from './components/Main/Main';

/**
 * Top-level component rendered in the page
 */
export default class UI extends Component {

	render() {
		return (
			<Provider store={store}>
				<ConnectedRouter history={history}>
					<Main/>
				</ConnectedRouter>
			</Provider>
		);
	};
}