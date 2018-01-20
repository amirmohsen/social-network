import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import UserActions from '../../../data/User';
import Error from '../Error/Error';
import Panel from '../Panel/Panel';

@withRouter
@connect(state => ({
	store: {
		currentUser: state.user.current
	}
}))
export default class MyProfile extends Component {

	static propTypes = {
		store: PropTypes.shape({
			currentUser: PropTypes.shape({
				email: PropTypes.string.isRequired,
				firstName: PropTypes.string.isRequired,
				lastName: PropTypes.string.isRequired,
				connections: PropTypes.arrayOf(PropTypes.string).isRequired,
				isAdmin: PropTypes.bool.isRequired
			})
		})
	};

	constructor(...args) {
		super(...args);
		this.state = {
			data: {
				...this.props.store.currentUser,
				password: '',
			},
			error: ''
		};
	}

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

		let error = await this.props.dispatch(UserActions.update({
			id: this.props.store.currentUser._id,
			data: this.state.data
		}));

		if(!error) {
			error = '';
		}

		this.setState({
			error
		});
	};

	render() {
		return (
			<Panel
				title="My Profile"
				actions={(
					<Button type="submit" raised color="primary">
						Save
					</Button>
				)}
				component="form"
				onSubmit={this.onSubmit}
			>
				<TextField
					label="First Name"
					name="firstName"
					value={this.state.data.firstName}
					onChange={this.onChange}
					margin="normal"
					fullWidth
				/>
				<TextField
					label="Last Name"
					name="lastName"
					value={this.state.data.lastName}
					onChange={this.onChange}
					margin="normal"
					fullWidth
				/>
				<TextField
					label="Email"
					type="email"
					name="email"
					value={this.state.data.email}
					onChange={this.onChange}
					margin="normal"
					fullWidth
				/>
				<TextField
					label="Password"
					type="password"
					name="password"
					value={this.state.data.password}
					onChange={this.onChange}
					margin="normal"
					autoComplete="new-password"
					placeholder="Leave empty to preserve current password"
					fullWidth
				/>
				<Error>
					{this.state.error}
				</Error>
			</Panel>
		);
	}
}