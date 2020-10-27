import React, { Component } from 'react';
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080',
})
const SUCCESS = 200;

export default class Login extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password:'',
            isLoggedIn: false,
            showErrorMsg: false,
            errorMessage:''
        };
    }
    

    /* functions */

    loginHandler = (e)=>{
        e.preventDefault();
        let varUsername = this.state.username;
        let varPassword = this.state.password;

        if(varUsername === '' || varPassword === ''){
           this.errorMessageHandler(true,'Username/ password shouldn\'t be empty');
        }else{
            this.validateLoginActionHandler(varUsername,varPassword);
        }
    }

    validateLoginActionHandler = (username,password) => {

        let userJSON = {
            "email": username,
            "password": password
        }
            api.post('/api/user/login',userJSON).then((result,err) => {
                if(result){
                    let resultData = result.data;
                    if(resultData["status"] == SUCCESS){
                        console.log(JSON.stringify(resultData["accessToken"]));
                        localStorage.setItem('accessToken',JSON.stringify(resultData["payload"]["accessToken"]));
                        localStorage.setItem('userDetails',JSON.stringify(resultData["payload"]["user"]));
                        window.location.href = "/application";
                    }else{                
                         this.errorMessageHandler(true, resultData["message"]);
                    }
                }                
        }).catch((err)=>{
console.log(err);
        });
    
    }

    usernameHandler = (e)=>{
        this.errorMessageHandler(false,'');
        this.setState({
            username: e.target.value
        })
        
    }
    passwordHandler = (e)=>{
        this.errorMessageHandler(false,'');
        this.setState({
            password: e.target.value
        })
    }


    errorMessageHandler = (inputShowErrorMsg,inputErrorMessage)=>{
        this.setState({
            showErrorMsg: inputShowErrorMsg,
            errorMessage: inputErrorMessage,
        })
    }

    render() {
        return (
                <div>
                    {this.state.showErrorMsg &&(<div> {this.state.errorMessage}  </div> )}                    
                    <form>
                        <h3>Log In</h3>
                        <input type="text" ref="username" onChange={this.usernameHandler} placeholder="Username" />
                        <input type="password" ref="password" onChange={this.passwordHandler} placeholder="Password" />
                        <input type="submit" value="Login"  onClick={this.loginHandler.bind()}/>
                    </form>
                </div>
        )
    }
}