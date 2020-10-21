import React, { Component } from 'react'
import { Router, Switch, Route } from 'react-router-dom'
import history from './History';

import WebsiteHome from './components/pages/Website'

export default class Routes extends Component {

    render() {
        return (
            <Router history={history}>
                <Switch>
                    <Route path="/" exact component={WebsiteHome} /> 
                </Switch>
            </Router>

        );
    }
}