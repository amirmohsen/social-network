import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import UserActions from '../../data/User';
import PropTypes from 'prop-types';
import Error from '../App/Error/Error';
import Panel from '../App/Panel/Panel';

@withRouter
@connect(state => ({
	store: {
		showRegisterForm: state.user.showRegisterForm,
		errors: state.user.errors
	}
}))
export default class RegisterLogin extends Component {

	static propTypes = {
		store: PropTypes.shape({
			showRegisterForm: PropTypes.bool.isRequired
		})
	};

	state = {
		data: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
		},
		error: ''
	};

	onChange = e => {
		let {name, value} = e.target;
		this.setState(prevState => ({
			data: {
				...prevState.data,
				[name]: value
			}
		}));
	};

	onSubmit = async e => {
		e.preventDefault();

		let error;

		if(this.props.store.showRegisterForm) {
			error  = await this.props.dispatch(UserActions.register(this.state.data));
		}
		else {
			error  = await this.props.dispatch(UserActions.login(this.state.data));
		}

		if(!error) {
			error = '';
		}

		this.setState({
			error
		});
	};

	componentWillUnmount() {
		this.props.dispatch(UserActions.hideRegisterForm());
	}

	getRegisterFields() {
		return [
			<TextField
				required
				key="firstName"
				label="First Name"
				name="firstName"
				value={this.state.data.firstName}
				onChange={this.onChange}
				fullWidth
			/>,
			<TextField
				required
				key="lastName"
				label="Last Name"
				name="lastName"
				type="lastName"
				value={this.state.data.lastName}
				onChange={this.onChange}
				fullWidth
			/>
		];
	}

	getTitle() {
		return this.props.store.showRegisterForm ? 'Register' : 'Login';
	}

	render() {
		return (
			<Panel
				title={this.getTitle()}
				actions={(
					<Button type="submit" raised color="primary">
						{this.getTitle()}
					</Button>
				)}
				component="form"
				onSubmit={this.onSubmit}
				width={500}
			>
				{this.props.store.showRegisterForm ? this.getRegisterFields() : null}
				<TextField
					required
					label="Email"
					name="email"
					value={this.state.data.email}
					onChange={this.onChange}
					fullWidth
				/>
				<TextField
					required
					label="Password"
					name="password"
					type="password"
					value={this.state.data.password}
					onChange={this.onChange}
					fullWidth
				/>
				<Error>
					{this.state.error}
				</Error>
			</Panel>
		);
	}
}