import React, { Component } from 'react';
import {Link} from 'react-router-dom'

export default class Application extends Component{
constructor(props){
    super(props);
}

state={
    user: localStorage.getItem("loggedusername")
}
    render(){
        return(
            <div>
             {this.state.user} 
		     <Link to="/login" >&nbsp;Logout</Link>
              This is Application Home  page.  
            </div>
        );
    }
    
}