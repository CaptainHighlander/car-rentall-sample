/**************************************
 * Politecnico di Torino
 * Applicazioni Web 1 (2019/2020)
 * ESAME 1 - "Noleggio Auto"
 * Riccardo Tedesco (269094)
 **************************************/

import React, { useState, useEffect } from 'react';
import API from './API/Api'

//#region My components:
import TitleBar from "./Components/TitleBar";
import Loading from './Components/Loading'
import MultipleFilter from './Components/Catalogue/MultipleFilter';
import VehiclesList from './Components/Catalogue/VehiclesList'
import Login from './Components/Login/LoginComponents'
import Configurator from './Components/Configurator/Configurator'
import UserRentals from './Components/UserProfile/UserRentals'
//#endregion

//#region React-Bootstrap components
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Collapse from 'react-bootstrap/Collapse';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
//#endregion
import { BrowserRouter as Router, Switch, Route, Redirect, Link } from 'react-router-dom';

function App() 
{
  const [vehicles, setVehicles] = useState([]);
  const [displayedVehicles, setDisplayedVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);
  const [isLoggedIn, setLoginStatus] = useState(false);
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const [someError, setSomeError] = useState(false);

  const handleErrors = (errorObj) => 
  {
    if (errorObj) 
    {
      setSomeError(true);
    }
  };

  const deleteError = () =>
  {
    setSomeError(false);
  };

  const getBrands = (vehiclesList) => 
  {
    return [...new Set(vehiclesList.map((vehicle) => { return (vehicle.brand) ? vehicle.brand : null; }))];
  };

  const loadVehiclesData = () => 
  {
    API.getAllVehicles()
       .then((vehiclesObj) => 
       {
          setVehicles(vehiclesObj);   
          setBrands(getBrands(vehiclesObj));
          setLoading(false);
       })
       .catch((errorObj) => { handleErrors(errorObj); });
  };

  const doFiltering = (filterCategory, filterBrand) =>
  {
    //#region filtering
    setFiltering(filterCategory.length >= 1 || filterBrand.length >= 1); //Check if some filter is selected or not.
    let filteredItems = [];
    if(filterCategory.length >= 1 && filterBrand.length >= 1)
      filteredItems = vehicles.filter((vehicle) => { return filterCategory.includes(vehicle.category) && filterBrand.includes(vehicle.brand); });
    else if(filterCategory.length >= 1)
      filteredItems = vehicles.filter((vehicle) => { return filterCategory.includes(vehicle.category); });
    else //if(filterBrand.length >= 1)
      filteredItems = vehicles.filter((vehicle) => { return filterBrand.includes(vehicle.brand); });
    if(filteredItems.length >= 1)
    {
      setDisplayedVehicles(filteredItems);
    }
    else if(displayedVehicles.length >= 1)
    {
      //No available elements that satisfy filters
      setDisplayedVehicles([]);
    }
    //#endregion
  };

  const login = (user) => 
  {
    setLoginStatus(true);
    setUser(user);
    API.getCSRFToken().then((response) => { setCsrfToken(response.csrfToken); } );
  }

  const logout = () => 
  {
    API.userLogout().then(() => 
    {
      setLoginStatus(false);
      setUser(null);
    });
  }

  const updateUserRentals = (variation) =>
  {
    user.rentals += variation;
    setUser(user);
  }

  useEffect(() => 
  {
    loadVehiclesData();
    if (!isLoggedIn) 
    {
      API.isUserAutheticated().then((userInfo) => 
      {
        login(userInfo);
      })
      .catch((err) => { handleErrors() });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 
  
  return (
    <Router>
      { (someError === true) && <ModalErrorMsg deleteError={deleteError}></ModalErrorMsg> }
      <TitleBar user={(user && user.name) ? user.name : ""} logged={isLoggedIn} logout={logout}></TitleBar>
      <Switch>
        <Route exact path='/login' render={(props) => 
        {
          return (isLoggedIn) ? (<Redirect to='/rental'></Redirect>) : (<Login login={login}></Login>);
        }}>
        </Route>
        <Route exact path='/rental' render={(props) =>
        {
          if(isLoggedIn)
          return(
            <Configurator user={user} csrfToken={csrfToken} updateUserRentals={updateUserRentals} handleErrors={handleErrors}></Configurator>
          );
          return (<Redirect to='/login'></Redirect>);
        }}>
        </Route>
        <Route exact path='/catalogue' render={(props) => 
        {
          if(!loading)
          {
            return(
              <Container>
                <Row className="vheight-100">
                  <Collapse>
                    <Col sm={4} bg="light" id="left-sidebar" className="collapse d-sm-block below-nav">
                      <MultipleFilter brands={brands} doFiltering={doFiltering}></MultipleFilter>
                    </Col>
                  </Collapse>
                  <Col sm={8} className="below-nav">
                    <h1>All our cars</h1>
                    <VehiclesList list={displayedVehicles} filtering={filtering}></VehiclesList>
                  </Col>
                </Row>
                { isLoggedIn && <Link to='/rental' className="btn btn-dark btn-rounded btn-md">Book now!</Link> } 
              </Container>
            );
          }
          else
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
        }}>
        </Route>
        <Route path='/your-rentals' render={(props) =>
        {
          if(isLoggedIn)
            return(
              <Row  className="justify-content-lg-center">
                <Col className="below-nav">
                  <UserRentals csrfToken={csrfToken} updateUserRentals={updateUserRentals} handleErrors={handleErrors}></UserRentals>
                </Col>
              </Row>
            );
          return (<Redirect to='/login'></Redirect>);
        }}>
        </Route>
        <Route path='/*'>
          <Redirect to='/catalogue'></Redirect>
        </Route>
        <Route exact path='/'>
          <Redirect to='/catalogue'></Redirect>
        </Route>
      </Switch>
    </Router>
  );
}

const ModalErrorMsg = (props) =>
{
    const [show, setShow] = useState(true);
  
    const handleClose = () =>
    {
      setShow(false);
      props.deleteError();
    }
  
    return ( 
      <Modal show={show} animation={false} onHide={handleClose}>
          <Modal.Header variant="dark" closeButton className="modal-header bg-info">
              <Modal.Title>Sorry</Modal.Title>
          </Modal.Header>
          <Modal.Body>Something went wrong!</Modal.Body>
          <Modal.Footer>
              <Button variant="dark" onClick={handleClose}>
              Close
              </Button>
          </Modal.Footer>
      </Modal>
    );
}

export default App;
