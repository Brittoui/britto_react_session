import React, {Component} from 'react';
import {BrowserRouter as Router,NavLink } from 'react-router-dom';
import {Route} from 'react-router-dom';

import Navigbar from './components/Navbar';
import WebsiteHome  from './components/pages/Website'
import Login  from './components/pages/Login'
import Application from './components/pages/Application'
import './App.css'
import About from './components/pages/About';


class App extends Component{

  render(){
  return(
<div>     
      <Router>    
 <ul>

<li>
    <NavLink to="/" exact activeStyle={
      {color:'blue'}
    } >Website</NavLink>
  </li>
  <li>
    <NavLink to="/about" exact activeStyle={
      {color:'blue'}
    } >About us</NavLink>
  </li>
	  <li>
		<NavLink to="/login" exact activeStyle={
      {color:'blue'}
    } >Login</NavLink>
  </li>
  </ul>           
         <Route path="/" exact strict component={WebsiteHome} />
         <Route path="/about" exact strict component={About} />
         <Route path="/login" exact strict component={Login} />
         <Route path="/application" exact strict component={Application} />
         </Router>
</div>
  );
  }

}


export default App