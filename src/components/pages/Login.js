import React, { Component } from 'react';
import Navbar from '../Navbar';
import Application from './Application';

export default class Login extends Component{ 

    constructor(props){
        super(props);
    }

    state={
        username:'',
        logged_in: false,
    }

    txtBoxHandler = (event)=>{
        this.setState({
            username: event.target.value
        });
    }

state={
  logged_in:false,
}

loginHandler = ()=>{
   this.setState ({
     logged_in : !this.state.logged_in
   })
   localStorage.setItem("loggedusername",this.state.username)

   if(localStorage.getItem("loggedusername") == undefined || localStorage.getItem("loggedusername") == ''){
       alert('Please enter valid credentials');
   }else{
    this.props.history.push("/application");
   }
}
render(){
    return(
        <div>
{ this.state.logged_in &&(
<Application />
) }
            This is login Page
{ !this.state.logged_in && (
            <div>
                <input type="text"  name="username" onChange={this.txtBoxHandler} />
                <input type="password" name="password" />
                <button  onClick={this.loginHandler.bind()} > Login </button>
            </div>
            )}
        </div>
    )
}
}
