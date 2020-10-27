import React, { Component } from 'react';
import axios from 'axios';
import DonorList from './DonorList';

const api = axios.create({
    baseURL: 'http://localhost:8080',
})

export default class Application extends Component{

    constructor(props) {
        super(props);
        if("userDetails" in localStorage){
            this.state ={
                userDetails: JSON.parse(localStorage.getItem('userDetails')),
                validLoggedIn: true
            }
        }else{            
            this.state ={
                userDetails: '',
                validLoggedIn: false
            }
                this.props.history.push("/");
        }
    }

logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    this.props.history.push("/");
}



    render(){
        return (
            <div>
                {this.state.validLoggedIn && (
                        <div>
                            <h4> Admin Page</h4>
                        <div>
                        <ul>
                            <li>Donors List</li>
                            <li>Add New Donors</li>
                        </ul>
                        <div> {this.state.userDetails.firstname}  </div>
                        <div onClick={this.logout.bind()}>  logout</div>
                        </div>
                        <div>
                            <DonorList />
                        </div>
                    </div>
                )}
            </div>
        )
    }
}