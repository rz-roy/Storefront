import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import _ from 'lodash';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import { AppBar, Toolbar, Avatar } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import KeyboardBackspaceIcon from '@material-ui/icons/KeyboardBackspace';
import ShoppingCartIcon from '@material-ui/icons/ShoppingCart';
import NotificationsNoneIcon from '@material-ui/icons/NotificationsNone';

import SearchInput from '../SearchInput';
import MDIconButtom from '../../SharedComponents/MDIconButton';
import DropDown from '../DropDown';
import LoginSignUpDlg from '../LoginSignUpDlg';
import UserDialog from '../UserDialog';
import { getUserAvatar } from '../../utils/auth';
import { TRANS_TYPE } from '../../constants';
import * as types from '../../actions/actionTypes';

const Header = ({ children }) => {
  const classes = useStyles();
  const dispatch = useDispatch();

  const [showLogin, setShowLogin] = useState(false);
  const [showUserDetail, setShowUserDetail] = useState(false);

  const { authInfo, transType } = useSelector((state) => ({
    authInfo: state.authReducer.userInfo,
    transType: state.storeReducer.transType,
  }));

  const checkIsLogin = () => {
    const uesrID = _.get(authInfo, 'id', null);
    if (uesrID === null) return false;
    return true;
  };

  return (
    <AppBar className={classes.Root}>
      <Toolbar>
        <MDIconButtom aria-label="open drawer">
          <MenuIcon color="Secondary.dark" />
        </MDIconButtom>
        <Link to="/" className={classes.LogoBrand}>
          myda
        </Link>
        <MDIconButtom aria-label="header back" wrapperClass={classes.BackButton}>
          <KeyboardBackspaceIcon color="Secondary.dark" />
        </MDIconButtom>
        <SearchInput />
        <DropDown
          value={{ id: transType, label: transType }}
          menuList={[
            { id: TRANS_TYPE.POS, label: TRANS_TYPE.POS },
            { id: TRANS_TYPE.DELIVERY, label: TRANS_TYPE.DELIVERY },
            { id: TRANS_TYPE.CLICK, label: TRANS_TYPE.CLICK },
          ]}
          wrapperStyles={{ marginLeft: 'auto', width: '147px', background: '#fff', borderRadius: '2px' }}
          buttonStyles={{ background: '#fff' }}
          onChange={(selected) => {
            dispatch({
              type: types.UPDATE_TRANS_TYPE,
              payload: selected.id,
            });
          }}
        />
        <MDIconButtom wrapperClass={classes.CartButton} aria-label="shopping-cart">
          <ShoppingCartIcon />
        </MDIconButtom>
        {checkIsLogin() ? (
          <>
            <MDIconButtom wrapperClass={classes.NotiButton}>
              <NotificationsNoneIcon />
            </MDIconButtom>
            <Avatar
              className={classes.UserAvatar}
              src={getUserAvatar(authInfo)}
              role="button"
              onClick={() => setShowUserDetail(true)}
            />
          </>
        ) : (
          <>
            <button className={classes.SignUpButton}>Signup</button>
            <button className={classes.LoginButton} onClick={() => setShowLogin(true)}>
              Login
            </button>
          </>
        )}
      </Toolbar>
      {showLogin && <LoginSignUpDlg hideLogin={() => setShowLogin(false)} />}
      {showUserDetail && <UserDialog hideModal={() => setShowUserDetail(false)} />}
    </AppBar>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    Root: {
      background: '#fff',
      '& .MuiToolbar-root': {
        height: '80px',
      },
    },
    LogoBrand: {
      color: '#0156b8',
      fontSize: '36px',
      textDecoration: 'none',
      fontWeight: 600,
      marginLeft: '18px',
    },
    BackButton: {
      marginLeft: '34px',
    },
    CartButton: {
      marginLeft: '52px',
    },
    NotiButton: {
      marginLeft: '40px',
    },
    SignUpButton: {
      color: '#0156b8',
      fontSize: '20px',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      marginLeft: '42px',
    },
    LoginButton: {
      color: '#0156b8',
      fontSize: '20px',
      background: 'transparent',
      border: 'none',
      outline: 'none',
      cursor: 'pointer',
      marginLeft: '42px',
    },
    UserAvatar: {
      cursor: 'pointer',
      width: '40px',
      height: '40px',
      marginLeft: '43px',
    },
  })
);

export default Header;
