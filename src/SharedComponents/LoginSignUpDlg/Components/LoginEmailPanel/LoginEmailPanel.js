import React, { useState } from 'react';

import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import { Button } from '@material-ui/core';

import { getEmailValidationSchema } from '../../../../validators/login-validation';

const LoginEmailPanel = ({ email, onChange, gotoPassword }) => {
  const classes = useStyles();
  const schema = getEmailValidationSchema();

  const handleChangeEmail = (e) => {
    schema
      .validate({ email: e.target.value })
      .then((res) => {
        onChange({
          value: res.email,
          validate: true,
          errorMsg: '',
        });
      })
      .catch((err) => {
        onChange({
          value: err.value.email,
          validate: false,
          errorMsg: err.errors[0],
        });
      });
  };

  return (
    <div className={classes.root}>
      <h3 className={classes.Title}>Sign in</h3>
      <p className={classes.Description}>Enter your email address to continue</p>
      <Box className={classes.InputWrapper}>
        <TextField
          className={classes.LoginInput}
          id="login-email"
          label="Email"
          fullWidth
          value={email.value}
          onChange={(e) => handleChangeEmail(e)}
          error={!email.validate}
          helperText={email.errorMsg}
          size="medium"
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        fullWidth
        className={classes.ContinueButton}
        disabled={!email.validate || email.value.length === 0}
        onClick={gotoPassword}
      >
        Continue
      </Button>
      <Button className={classes.SignUpButton}>New to Myda? Signup</Button>
    </div>
  );
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      paddingLeft: '10px',
      paddingRight: '10px',
      alignItems: 'center',
      marginTop: '-5px',
    },
    Title: {
      fontSize: '22px',
      lineHeight: 1.36,
      letterSpacing: '0.41px',
      color: theme.palette.primary.dark,
      textAlign: 'center',
      margin: 0,
    },
    Description: {
      fontSize: '18px',
      fontWeight: 300,
      lineHeight: 1.22,
      color: theme.palette.primary.dark,
      margin: '40px 0 0 0',
      textAlign: 'center',
    },
    InputWrapper: {
      marginTop: '40px',
      minHeight: '70px',
      width: '100%',
    },
    LoginInput: {
      '& .MuiInput-input': {
        height: '40px',
        padding: 0,
      },
    },
    ContinueButton: {
      marginTop: '20px',
      height: '50px',
    },
    SignUpButton: {
      marginTop: '34px',
      fontSize: '16px',
      color: theme.palette.primary.dark,
      lineHeight: '19px',
      fontWeight: 300,
    },
  })
);

export default LoginEmailPanel;