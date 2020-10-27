import React, { Component } from 'react';
import axios from 'axios';

const api= axios.create({
    baseURL: 'http://localhost:8080',
})

export default class DonorList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            donorusers: [],
        }
    }

    componentDidMount() { 
        api.get('/api/getdata/').then((result)=>{
             if(result && result.data.data.length>0){
                console.log(`Result: ${JSON.stringify(result)}`);
                if(result.data["status"] == 'SUCCESS'){

                    this.setState(prevState =>({
                        donorusers: result.data.data, 
                    }))
                   console.log(`only data part ${this.state.donorusers}`)
                }
             }

        }).catch((err)=>{
            console.log(err);
        })
      }


    render(){
        return (
            <div>
            
                DONORS LIST

                <div>
                    <table>
                        <thead>
                            <tr>
                            <th>Donor's Name</th> 
                            <th>Donor's Email</th>
                            <th>DOB</th>
                            <th>Blood Group</th>
                            <th>Phone Number</th>
                            </tr>
                        </thead>
                        <tbody>    
                        {this.state.donorusers.map((item,index) => (                       
                            <tr key={index}>
                               
                            <td>{item.doners_name}</td>
                            <td>{item.doners_email}</td>
                            <td>{item.dob}</td>
                            <td>{item.blood_group}</td>
                            <td>{item.contact_number}</td>
                            </tr>
                                    ))
                                }

                           
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}