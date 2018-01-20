import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Redirect, withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import UserActions from '../../../data/User';
import Panel from '../Panel/Panel';
import ConnectionsTable from '../ConnectionsTable/ConnectionsTable';
import has from 'lodash/has';

@withRouter
@connect(state => ({
	store: {
		users: state.user.users,
		currentUser: state.user.current
	}
}))
export default class User extends Component {

	static propTypes = {
		store: PropTypes.shape({
			users: PropTypes.objectOf(PropTypes.object).isRequired
		})
	};

	componentWillMount() {
		this.props.dispatch(UserActions.getUser({id: this.props.match.params.id}));

		if(this.props.store.currentUser.isAdmin) {
			this.props.dispatch(UserActions.loadConnections({
				userId: this.props.match.params.id
			}));
		}
	}

	componentWillReceiveProps(nextProps) {
		if(this.props.match.params.id !== nextProps.match.params.id) {
			this.props.dispatch(UserActions.getUser({id: nextProps.match.params.id}));
		}
	}

	connect = () => {
		this.props.dispatch(UserActions.connect({
			userId: this.props.store.currentUser._id,
			connectionId: this.props.match.params.id
		}));
	};

	disconnect = () => {
		this.props.dispatch(UserActions.disconnect({
			userId: this.props.store.currentUser._id,
			connectionId: this.props.match.params.id
		}));
	};

	isConnected() {
		for(const connection of this.props.store.currentUser.connections) {
			if(connection === this.props.match.params.id || connection._id === this.props.match.params.id) {
				return true;
			}
		}
		return false;
	}

	getData() {
		return this.props.store.users[this.props.match.params.id];
	}

	getConnectionsData() {
		let user = this.getData();
		return has(user, `connections.0._id`) ? user.connections : [];
	}

	getConnections() {
		if(this.props.store.currentUser.isAdmin) {
			return <ConnectionsTable data={this.getConnectionsData()}/>;
		}
		return null;
	}

	render() {
		const user = this.getData();

		if(!user) {
			return null;
		}

		if(user._id === this.props.store.currentUser._id) {
			return <Redirect to="/user/current"/>;
		}

		const isConnected = this.isConnected();

		return (
			<Panel
				title={`${user.firstName} ${user.lastName}`}
				actions={[
					<Button
						onClick={isConnected ? this.disconnect : this.connect}
						type="button"
						color="accent"
						key="connect"
						raised
					>
						{isConnected ? 'Disconnect' : 'Connect'}
					</Button>
				]}
			>
				<Typography type="caption" component="span">
					{user.email}
				</Typography>
				{this.getConnections()}
			</Panel>
		);
	}
}