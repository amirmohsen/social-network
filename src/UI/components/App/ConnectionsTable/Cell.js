import React, {Component} from 'react';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import { Table } from '@devexpress/dx-react-grid-material-ui';
import IconButton from 'material-ui/IconButton';
import ConnectIcon from 'material-ui-icons/PersonAdd';
import DisconectIcon from 'material-ui-icons/RemoveCircle';
import ViewIcon from 'material-ui-icons/Pageview';
import {Link} from 'react-router-dom';
import UserActions from '../../../data/User';

@withRouter
@connect(state => ({
	store: {
		currentUser: state.user.current
	}
}))
export default class Cell extends Component {

	connect = () => {
		this.props.dispatch(UserActions.connect({
			userId: this.props.store.currentUser._id,
			connectionId: this.props.value
		}));
	};

	disconnect = () => {
		this.props.dispatch(UserActions.disconnect({
			userId: this.props.store.currentUser._id,
			connectionId: this.props.value
		}));
	};

	isConnected() {
		for(const connection of this.props.store.currentUser.connections) {
			if(connection === this.props.value || connection._id === this.props.value) {
				return true;
			}
		}
		return false;
	}

	render() {
		let value = null, isConnected = this.isConnected();

		switch(this.props.column.name) {
			case 'connect':
				value = (
					<IconButton color="accent" onClick={isConnected ? this.disconnect : this.connect}>
						{isConnected ? <DisconectIcon/> : <ConnectIcon/>}
					</IconButton>
				);
				break;
			case 'view':
				value = (
					<IconButton color="accent" component={Link} to={`/user/${this.props.value}`}>
						<ViewIcon/>
					</IconButton>
				);
				break;
		}

		if(value && this.props.store.currentUser._id === this.props.value) {
			return null;
		}

		const {
			dispatch,
			history,
			location,
			match,
			staticContext,
			store,
			...props
		} = this.props;

		return (
			<Table.Cell {...props}>
				{value}
			</Table.Cell>
		);
	}
}