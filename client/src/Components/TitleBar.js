import React from 'react';
//#region React-Bootstrap components
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Badge from 'react-bootstrap/Badge'
import DropdownButton from 'react-bootstrap/DropdownButton'
//#endregion
import { CheckAll, PersonPlus, PersonDash } from 'react-bootstrap-icons'

import { NavLink, Link } from 'react-router-dom' ;

const TitleBar = (props) => 
{
  return (
   <Navbar bg="dark" variant="dark" expand="sm" fixed="top">
      <Navbar.Toggle aria-controls="left-sidebar" aria-expanded="false" aria-label="Toggle sidebar" onClick={props.showSidebar}/>

      <Navbar.Brand>
         <CheckAll color="green" size='30'></CheckAll>
         <NavLink exact to='/catalogue' activeStyle={{color: "white"}}>CH - Cars Rental</NavLink>
      </Navbar.Brand>
      
      <Nav className="ml-md-auto">
         <h2>
            <Badge variant="dark">
               Welcome, { (props.user !== '') ? props.user : "guest" }
            </Badge>
         </h2>
      </Nav>   
      { 
         (props.logged === true) && 
         <DropdownButton id="dropdown-basic-button" variant="success" title="Your profile">
               <Link to='/your-rentals' className="dropdown-item">Your rentals</Link>
         </DropdownButton>
      }

      <Link className='btn btn-dark' to ='/login'> 
         { (props.logged !== true) && <PersonPlus color="green" size='30'></PersonPlus> }
         { (props.logged === true) && <PersonDash onClick = {() => {props.logout()}} color="green" size='30'></PersonDash> }     
      </Link> 
    </Navbar>
  );
}

export default TitleBar;
