import React from 'react';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

const AuthModal = ({ isShow, hideModal, children, wrapperClass }) => {
  const classes = useStyles();

  const rootClass = [classes.root];
  if (wrapperClass) rootClass.push(wrapperClass);

  const handleClick = () => {
    hideModal();
  };

  return (
    <Paper className={rootClass.join(' ')}>
      <IconButton onClick={handleClick} className={classes.CloseButton}>
        <CloseIcon />
      </IconButton>
      {children}
    </Paper>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      position: 'absolute',
      top: '80px',
      right: '24px',
      width: '100%',
      maxWidth: '383px',
      minHeight: '385px',
      boxShadow: '0 1px 4px 0 rgba(186, 195, 201, 0.5)',
      border: 'solid 1px rgba(186, 195, 201, 0.5)',
      backgroundColor: '#fff',
      padding: '25px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      '@media screen and (max-width: 767px)': {
        right: 'calc(50% - 191.5px)',
      },
    },
    CloseButton: {
      width: '40px',
      height: '40px',
      padding: 0,
      position: 'absolute',
      right: '15px',
      top: '15px',
      borderRadius: '20px',
      backgroundColor: 'rgba(186, 195, 201, 0.3)',
      zIndex: 1,
      '&: hover': {
        backgroundColor: 'rgba(186, 195, 201, 0.6)',
      },
    },
  })
);

export default AuthModal;
