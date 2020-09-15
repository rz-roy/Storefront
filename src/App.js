import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { getCountryCode } from './apis';
import { Switch, BrowserRouter as Router, Route } from 'react-router-dom';

import StoreFrontPage from './Pages/StoreFront';
import ResetPasswordPage from './Pages/ResetPassword';
import './App.css';

import { setLocalizationAction } from './actions/localizationAction';

const App = ({ setLocalizationAction }) => {
  useEffect(() => {
    getCountryCode()
      .then((res) => {
        setLocalizationAction(res.data.country);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [setLocalizationAction]);

  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/resetpassword/:code" component={ResetPasswordPage} />
          <Route path="/" component={StoreFrontPage} />
        </Switch>
      </div>
    </Router>
  );
};

export default connect(null, { setLocalizationAction })(App);
