import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link, withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import Menu from 'material-ui/Menu';
import MenuItem from 'material-ui/Menu/MenuItem';
import AccountCircle from 'material-ui-icons/AccountCircle';
import GroupIcon from 'material-ui-icons/GroupWork';
import UserActions from '../../../data/User';
import styles from './TopBar.css';

@withRouter
@connect(state => ({
	store: {
		currentUser: state.user.current
	}
}))
export default class TopBar extends Component {

	static propTypes = {
		store: PropTypes.shape({
			currentUser: PropTypes.object
		})
	};

	state = {
		auth: true,
		anchorEl: null,
	};

	handleMenu = event => this.setState({ anchorEl: event.currentTarget });

	handleClose = () => this.setState({ anchorEl: null });

	logout = () => this.props.dispatch(UserActions.logout());

	render() {
		const { anchorEl } = this.state;
		const open = !!anchorEl;

		return (
			<AppBar position="static" className={styles.root}>
				<Toolbar>
					<IconButton component={Link} to="/" className={styles.menuButton} color="inherit" aria-label="Menu">
						<MenuIcon />
					</IconButton>
					<Typography type="title" color="inherit" className={styles.title}>
						Social Media
					</Typography>
					<Typography type="subheading" color="inherit">
						{this.props.store.currentUser.firstName} {this.props.store.currentUser.lastName}
					</Typography>
					<IconButton
						aria-owns={open ? 'menu-appbar' : null}
						aria-haspopup="true"
						component={Link}
						color="contrast"
						to="/user/current/connections"
					>
						<GroupIcon/>
					</IconButton>
					<IconButton
						aria-owns={open ? 'menu-appbar' : null}
						aria-haspopup="true"
						onClick={this.handleMenu}
						color="contrast"
					>
						<AccountCircle />
					</IconButton>
					<Menu
						id="menu-appbar"
						anchorEl={anchorEl}
						anchorOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						transformOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						open={open}
						onClose={this.handleClose}
					>
						<MenuItem onClick={this.handleClose}><Link to="/user/current">My Profile</Link></MenuItem>
						<MenuItem onClick={this.logout}>Logout</MenuItem>
					</Menu>
				</Toolbar>
			</AppBar>
		);
	}
}