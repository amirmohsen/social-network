import React, {Component} from 'react';
import {Switch, Route} from 'react-router-dom';
import styles from './App.css';
import TopBar from './TopBar/TopBar';
import MyProfile from './MyProfile/MyProfile';
import Search from './Search/Search';
import User from './User/User';
import Connections from './Connections/Connections';

export default class App extends Component {

	render() {
		return (
			<div className={styles.root}>
				<TopBar/>
				<Switch>
					<Route path="/" component={Search} exact/>
					<Route path="/user/current" component={MyProfile} exact/>
					<Route path="/user/current/connections" component={Connections} exact/>
					<Route path="/user/:id" component={User} exact />
				</Switch>
			</div>
		);
	}
}