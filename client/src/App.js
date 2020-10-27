import React, { Component } from 'react';
import {BrowserRouter as Router,Route, NavLink } from 'react-router-dom';
import './App.css'
import Home from './components/Home';
import Login from './components/Login';
import Application from './components/Application';

export default class App extends Component{

    render(){
      return (

        <div className="blood_donor_app">
          <Router>
          <Route path="/" exact strict component={Home} />
          
          <Route path="/login" exact component={Login} />
          <Route path="/application" exact component={Application} />

          </Router>
        </div>
      )
    }  
}