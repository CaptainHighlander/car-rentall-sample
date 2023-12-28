import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';

//#region React-Bootstrap components
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Collapse from 'react-bootstrap/Collapse';
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
//#endregion
import API from '../../API/Api'
//#region My Components:
import PayForm from './PayForm'
import Loading from '../Loading'
//#endregion
const validator = require('validator');

const MAX_EXTRA_DRIVERS = 10;
//#region Errors:
const PERIOD_ERROR_1 = "Both dates must be prior to today";
const PERIOD_ERROR_2 = "Start date must precede end date";
const AGE_ERROR = "Age value must be a number between 18 and 80";
const EXTRA_DRIVERS_ERROR = "The Value must be a number compresed between 0 and " + MAX_EXTRA_DRIVERS;
//#endregion

//#region Utility functions
const checkDates = (startDate, endDate) =>
{
   if(validator.isDate(startDate) === false || validator.isDate(endDate) === false)
      return 1;
   
   //No past dates
   const now = moment().format('YYYY-MM-DD');
   if(moment(now).isAfter(startDate) === true || moment(now).isAfter(endDate) === true)
      return 2;

   //Start date MUST come before end date.
   return (moment(startDate).isBefore(endDate)) ? 0 : 3;
}
//#endregion

const Configurator = (props) => 
{
   const [category, setCategory] = useState('');
   const [age, setAge] = useState({ageValue: null, ageError: ''});
   const [extraDrivers, setExtraDrivers] = useState({extraDriversValue: null, extraDriversError: ''});
   const [period, setPeriod] = useState({dates: ['', ''], periodError: ''});
   const [extraInsurance, setExtraInsurance] = useState(false);
   const [estimatedKm, setEstimatedKmRB] = useState(null);
   const [prenotationConfirmed, setPrenotationConfirmed] = useState(false);
   const [finalPrice, setFinalPrice] = useState(null); 
   const [loading, setLoading] = useState(false);

   const resetRentalParams = () =>
   {
      setCategory('');
      setAge({ageValue: null, ageError: ''});
      setExtraDrivers({extraDriversValue: null, extraDriversError: ''});
      setPeriod({dates: ['', ''], periodError: ''});
      setExtraInsurance(false);
      setEstimatedKmRB(null);
      setPrenotationConfirmed(false);     
      setFinalPrice(null);
   }

   //#region Methods for children
   const confirmPrenotation = (price) =>
   {
      let reservationParams = getParameters();
      reservationParams.price = price;
      API.doReservation(reservationParams, props.csrfToken)
         .then(() =>
         {
            setFinalPrice(price);
            setPrenotationConfirmed(true);
         })
         .catch((errorObj) => { props.handleErrors(errorObj) });
   }

   const finalizePrenotation = (wasFailed) =>
   {
      setPrenotationConfirmed(false);
      if(wasFailed === false) //Good payment!
      {
         setLoading(true);
         let rental = getParameters();
         delete rental.numberOfRentals;
         API.addRental(rental, props.csrfToken)
            .then(() => 
            { 
               props.updateUserRentals(1);
               resetRentalParams(); 
               setLoading(false); 
            })
            .catch((errorObj) => { props.handleErrors(errorObj) });
      }
      else
      {
         resetRentalParams();
      }
   }

   const getErrors = () =>
   {
      const errors = 
      {
         ageError: age.ageError,
         extraDriversError: extraDrivers.extraDriversError,
         periodError: period.periodError,
      };
      return errors;
   }

   const getParameters = () =>
   {
      const params =
      {
         category: category,
         age: age.ageValue,
         extraDrivers: extraDrivers.extraDriversValue,
         startDate: period.dates[0],
         endDate: period.dates[1],
         extraInsurance: extraInsurance,
         estimatedKm: estimatedKm,
         numberOfRentals: props.user && props.user.rentals,
      }
      return params;
   }

   const canProvideList = () =>
   {
      if(category === '')
         return false;
      if(period.dates.filter((element) => { return element !== '' }).length !== 2)
         return false;     
      return true;
   }

   const canCalculatePrice = () =>
   {
      if(canProvideList() === false)
         return false;
      if(age.ageValue === null || extraDrivers.extraDriversValue === null || estimatedKm === null)
         return false;
      return true;
   }
   //#endregion

   const handleSelectedCategory = (categoryValue) =>
   {
      setCategory(categoryValue);
   }

   const validateAge = (age_value) =>
   {
      if(validator.isInt(age_value, { min: 18, max: 80 }) === true) 
      {
         setAge({ageValue: age_value, ageError: ''});
      }
      else
      {
         setAge({ageValue: null, ageError: AGE_ERROR});
      }
   }

   const validateExtraDrivers = (number) =>
   {
      if(validator.isInt(number, { min: 0, max: MAX_EXTRA_DRIVERS }) === true)
      {
         setExtraDrivers({extraDriversValue: number, extraDriversError: ''});
      }
      else
      {
         setExtraDrivers({extraDriversValue: null, extraDriversError: EXTRA_DRIVERS_ERROR});
      }
   }

   const validateDates = (date1, date2) =>
   {
      const validDates = checkDates(date1, date2);
      if(validDates === 0) 
      {
         setPeriod({dates: [date1, date2], periodError: ''});
      } 
      else
      {
         if(validDates === 1)
         {
            setPeriod({dates: ['', ''], periodError: ''});
         }
         else if(validDates === 2)
         {
            setPeriod({dates: ['', ''], periodError: PERIOD_ERROR_1});
         }
         else if(validDates === 3)
         {
            setPeriod({dates: ['', ''], periodError: PERIOD_ERROR_2});
         }
      } 
   }

   const handleExtraInsuranceCB = () =>
   {
      setExtraInsurance(!extraInsurance);
   }

   const handleKmRadioButton = (id) =>
   {
      switch(id)
      {
         case 'radio50km':
            setEstimatedKmRB('50');
            break;
         case 'radio150km':
            setEstimatedKmRB('150');
            break;
         case 'radioUnlimited':
            setEstimatedKmRB('Unlimited');
            break;
         default:
            break;
      }
   }

   //#region Rendering
   if(loading === true)
   {
      return(
         <Container>
           <Row className="vheight-100">
             <Col sm={8} className="below-nav">
               <Loading loadingMessage={" Loading..."}></Loading>
             </Col>
           </Row>
         </Container>
      );
   }
   if(prenotationConfirmed === true)
      return <PayForm csrfToken={props.csrfToken} price={finalPrice} finalizePrenotation={finalizePrenotation}></PayForm>
   return(
      <Container>
         <Row className="vheight-100">
            <Col className="below-nav">
               <Card border="primary" style={{ width: '50rem' }}>
                  <Card.Header><h2>Let's Book one car</h2></Card.Header>
                  <Card.Body>
                     <ConfiguratorPseudoForm 
                        handleSelectedCategory = {handleSelectedCategory}
                        validateAge = {validateAge}
                        validateExtraDrivers = {validateExtraDrivers}
                        validateDates = {validateDates}
                        handleExtraInsuranceCB = {handleExtraInsuranceCB}
                        handleKmRadioButton = {handleKmRadioButton}
                        getErrors = {getErrors}
                     />
                  </Card.Body>
               </Card>
            </Col>
            <Collapse>
               <Col sm={{ span: 3, offset: 0 }} bg="light" className="collapse d-sm-block below-nav">
                  <ResultsPseudoForm canProvideList={canProvideList} canCalculatePrice={canCalculatePrice} getParameters={getParameters} confirmPrenotation={confirmPrenotation}></ResultsPseudoForm>
               </Col>
            </Collapse>
         </Row>
      </Container>
   );
   //#endregion
}

const ConfiguratorPseudoForm = (props) => 
{
   const formRef = useRef();

   return(
      <Form ref={formRef}>
         <Container>
            <Row>
               <Col>
                  <Form.Group controlId="category">
                     <Form.Label>Choose a category</Form.Label>
                     <Form.Control as="select" name="category" defaultValue="" onChange={(ev) => props.handleSelectedCategory(ev.target.value)}>
                        <option>A</option>
                        <option>B</option>
                        <option>C</option>
                        <option>D</option>
                        <option>E</option> 
                        <option disabled></option> 
                     </Form.Control>
                  </Form.Group>
               </Col>
               <Col>
                  <Form.Group controlId="age">
                     <Form.Label>Your age</Form.Label>
                     <Form.Control type="number" name="age" min="18" max="80" onChange={(ev) => props.validateAge(ev.target.value)}/>
                     <Form.Text id="categoryError" muted>
                        { (props.getErrors().ageError)}
                     </Form.Text>
                  </Form.Group>
               </Col>
               <Col>
                  <Form.Group controlId="extraDrivers">
                     <Form.Label>Extra drivers</Form.Label>
                     <Form.Control type="number" name="extraDrivers" min="0" max={MAX_EXTRA_DRIVERS} onChange={(ev) => props.validateExtraDrivers(ev.target.value)}/>
                     <Form.Text id="categoryError" muted>
                        { (props.getErrors().extraDriversError)}
                     </Form.Text>
                  </Form.Group>
               </Col>
            </Row>

            <Row onChange={(ev) => props.validateDates(formRef.current.startDate.value, formRef.current.endDate.value)}>
               <Col>
                  <Form.Group controlId="startDate">
                     <Form.Label>Start Date</Form.Label>
                     <Form.Control type="date" name="startDate"/>
                  </Form.Group>
                  <Form.Text id="categoryError" muted>
                        { (props.getErrors().periodError)}
                  </Form.Text>
               </Col>
               <Col>
                  <Form.Group controlId="endDate">
                     <Form.Label>End Date</Form.Label>
                     <Form.Control type="date" name="endDate"/>
                  </Form.Group>
               </Col>
            </Row>

            <Form.Group id="extraInsuranceCheckbox">
               <Form.Check type="checkbox" name="extraInsuranceCheckbox" label="I wish an extra insurance" onChange={(ev) => props.handleExtraInsuranceCB()}/>
            </Form.Group>

            <fieldset>
               <Form.Group controlId="estimatedKmRB" onChange={(ev) => props.handleKmRadioButton(ev.target.id)}>
                  <Form.Label>Estimated km/days</Form.Label>
                  <Form.Check type="radio" label="Less than 50 km/days" name="estimatedKmRB" id="radio50km"/>
                  <Form.Check type="radio" label="Between 50 km/days and 150 km/days" name="estimatedKmRB" id="radio150km"/>
                  <Form.Check type="radio" label="Unlimited" name="estimatedKmRB" id="radioUnlimited"/>
               </Form.Group>
            </fieldset>
         </Container>
      </Form>
   );
}

const ResultsPseudoForm = (props) =>
{
   const formRef = useRef();
   const [results, setResults] = useState('--');
   const [price, setPrice] = useState('--');

   useEffect(() => 
   {
      if(props.canProvideList() === true)
      {
         const params = props.getParameters();
         API.getAvailableVehiclesNumber(params.category, params.startDate, params.endDate)
         .then((resObj) => 
         {
            if(results !== resObj.Availability)
               setResults(resObj.Availability);
         })
         .catch((errorObj) => { setResults('--') });
      }
      else if(results !== '--')
      {
         setResults('--');
      }

      if(props.canCalculatePrice() === true)
      {
         const rentalParams = props.getParameters();

         //Try to calculate price
         API.getPriceQuotation(rentalParams)
         .then((resObj) => 
         {
            if(price !== resObj.price)
               setPrice(resObj.price);
         })
         .catch((errorObj) => { setPrice('--') });
      }
      else if(price !== '--')
      {
         setPrice('--');
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [props]); 
   
   return(
      <Card border="primary" style={{ width: '14rem' }}>
         <Card.Header>
            <h2>Summary</h2>
         </Card.Header>
         <Card.Body>
            <Form ref={formRef}>
               <Card.Title>Available cars</Card.Title>
               <Form.Group controlId="numberResults">
                  <Col md={{ span: 6, offset: 0 }}>
                     <Form.Control type="text" value={results} readOnly disabled/>
                  </Col>
                  {(results === '--') && <Form.Text className="text-muted">
                     Please, type (correctly) at least category, start date and end date
                  </Form.Text>}
               </Form.Group>
               <Card.Title>Price (EUR)</Card.Title>
               <Form.Group controlId="price">
                  <Col md={{ span: 10, offset: 0 }}>
                     <Form.Control type="text" value={price} readOnly disabled/>
                  </Col>
                  {(price === '--') && <Form.Text className="text-muted">
                     Please, fill in (correctly) each field of the form on the left
                  </Form.Text>}
               </Form.Group>
               { (price === '--' || results === '--' || results === '0') && <Button className="btn btn-dark" disabled>Proceed to order!</Button> }
               { (price !== '--' && results !== '0' && results !== '--') && <Button className="btn btn-dark" onClick={() => props.confirmPrenotation(price)}>Proceed to order!</Button> }
            </Form> 
         </Card.Body>
      </Card>
   );

}

export default Configurator;
