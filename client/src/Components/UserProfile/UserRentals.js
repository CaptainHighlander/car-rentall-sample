import React, { useState, useEffect } from 'react';

//#region React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Table from 'react-bootstrap/Table'
import Image from 'react-bootstrap/Image';
//#endregion
import API from '../../API/Api'
//#region My Components:
import Loading from '../Loading'
import OptionalMessage from '../OptionalMessage'
//#endregion

const HEADER_MESSAGE_NO_ELEMENTS = "Ops!";
const TEXT_MESSAGE_NO_ELEMENTS  = "Sorry, no results found!";

const PAST = "past";
const CURRENT = "current";
const FUTURE = "future";
const PAST_TITLE = "Your old rentals";
const CURRENT_TITLE = "Your current rentals"
const FUTURE_TITLE = "Your next rentals"

const UserRentals = (props) =>
{
   const [rentals, setRentals] = useState([]);
   const [history, setHistory] = useState({period: CURRENT, title: CURRENT_TITLE});
   const [loading, setLoading] = useState(true);

   useEffect(() => 
   {
      loadRentals();
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [history]); 

   const loadRentals = () =>
   {
      API.getUserRentals(history.period, props.csrfToken)
         .then((rentalsObj) => 
         { 
            setRentals(rentalsObj);
            setLoading(false); 
         })
         .catch((errorObj) => { props.handleErrors(errorObj) });
   }

   const changeHistory = (_period, _title) =>
   {
      setLoading(true);
      setHistory({period: _period, title: _title});
   }

   const deleteRental = (id) =>
   {
      setLoading(true);
      API.deleteRental(id, props.csrfToken)
         .then(() => 
         {
            props.updateUserRentals(-1);
            setHistory({period: history.period, title: history.title});
         })
         .catch((errorObj) => { props.handleErrors(errorObj) });
   }

   let lastKey = 1;
   return(
      <Container>
         <h2>Your Rentals</h2>
         <Row className="justify-content-lg-center">
            <Col>               
               <Card>
                  <Card.Header>
                     <Button variant="info" size="lg" onClick={() => changeHistory(PAST, PAST_TITLE)} disabled={loading}>
                        Past
                     </Button>{' '}
                     <Button variant="secondary" size="lg"  onClick={() => changeHistory(CURRENT, CURRENT_TITLE)} disabled={loading}>
                        Current
                     </Button>{' '}
                     <Button variant="info" size="lg"  onClick={() => changeHistory(FUTURE, FUTURE_TITLE)} disabled={loading}>
                        Future
                     </Button>{' '}
                  </Card.Header>
                  <Card.Body>
                     <Card.Title>{history.title}</Card.Title>
                     { (loading === true) && <Loading loadingMessage="Loading... wait, please"></Loading> }
                     { 
                     (loading === false && rentals.length >= 1) &&
                     <Table striped bordered hover variant="warning">
                        <thead>
                           <tr>
                              <th>#</th>
                              <th>Start Date</th>
                              <th>End Date</th>
                              <th>Category</th>
                              <th>Additional drivers</th>
                              <th>Estimated km/days</th>
                              <th>Extra insurance</th>
                           </tr>
                        </thead>
                        <tbody>
                           { rentals.map((rental) => <RentalListRow key={lastKey} number={lastKey++} rental={rental} period={history.period} deleteRental={deleteRental}></RentalListRow>) }
                        </tbody>
                     </Table>  
                     }
                     {
                     (loading === false && rentals.length === 0) &&
                     <OptionalMessage variant="warning" headerText={HEADER_MESSAGE_NO_ELEMENTS} msgText={TEXT_MESSAGE_NO_ELEMENTS}></OptionalMessage>
                     }
                  </Card.Body>
               </Card>
            </Col>
         </Row>
      </Container>
   );
}

const RentalListRow = (props) => 
{
   return (
      <tr>
         <td>{props.number}</td>
         <td>{props.rental.startDate}</td>
         <td>{props.rental.endDate}</td>
         <td>{props.rental.category}</td>
         <td>{props.rental.additionalDrivers}</td>
         <td>{props.rental.estimatedKm}</td>
         <td>{props.rental.extraInsurance}</td>
         { (props.period === FUTURE) && <td><Image width="20" height="20" className="img-button" src="svg/delete.svg" alt ="Delete rental" title="Delete rental" onClick={() => props.deleteRental(props.rental.id)}/></td> }
      </tr>
   );
}

export default UserRentals;
