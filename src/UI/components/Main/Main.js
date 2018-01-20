import React, {Component} from 'react';
import Helmet from 'react-helmet';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import Reboot from 'material-ui/Reboot';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import RegisterLogin from '../RegisterLogin/RegisterLogin';
import styles from './Main.css';
import UserActions from '../../data/User';
import App from '../App/App';

const theme = createMuiTheme({
	palette: {
		// type: 'dark'
	}
});

@withRouter
@connect(state => ({
	store: {
		currentUser: state.user.current
	}
}))
export default class Main extends Component {

	static propTypes = {
		store: PropTypes.shape({
			currentUser: PropTypes.object
		})
	};

	componentWillMount() {
		this.props.dispatch(UserActions.current());
	}

	render() {
		return (
			<MuiThemeProvider theme={theme}>
				<div className={styles.root}>
					<Helmet titleTemplate="%s | Social Media" defaultTitle="Social Media">
						<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500"/>
						<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/>
					</Helmet>
					<Reboot/>
					{this.props.store.currentUser ? <App/> : <RegisterLogin/>}
				</div>
			</MuiThemeProvider>
		);
	}
}