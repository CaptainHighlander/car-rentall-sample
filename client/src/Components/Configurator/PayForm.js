import React, { useState, useRef } from 'react';

//#region React-Bootstrap components
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
//#endregion
import Payment from '../../API/Payment'
import API from '../../API/Api'
//#region My components:
import Loading from '../Loading'
//#endregion

const PayForm = (props) =>
{
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cvv, setCvv] = useState('');
    const [waitingPayment, setWaitingPayment] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState({error: false, message: ''});
    const formRef = useRef();
   
    const updateNameField = (value) => 
    {
        setName(value);
    }

    const updateSurnameField = (value) => 
    {
        setSurname(value);
    }

    const updateCardNumberField = (value) => 
    {
        setCardNumber(value);
    }

    const updateCvvField = (value) => 
    {
        setCvv(value);
    }

    const pay = (event) => 
    {
        event.preventDefault();
        if (formRef.current.checkValidity()) 
        {
            setWaitingPayment(true);
            const payment = new Payment(name + " " + surname, cardNumber, cvv, props.price);
            API.newPayment(payment, props.csrfToken)
            .then(() => 
            {
                setPaymentStatus({error: false, message: "Transaction successful!"});
            })
            .catch((errorObj) => { setPaymentStatus({error: true, message: "Transaction failed!"}); });
        } 
        else 
        {
            formRef.current.reportValidity();
        }
    }

    //Rendering:
    return (
        <>
        { (paymentStatus.message !== '') && <ModalPayment paymentStatus={paymentStatus} finalizePrenotation={props.finalizePrenotation}></ModalPayment> }
        <Form className="below-nav" ref={formRef} onSubmit={pay}>
            <Container>
                <Row className="justify-content-md-center">
                    <Col  sm={{ span: 6, offset: 0 }} className="collapse d-sm-block">
                        <h2>
                            Pay to confirm you prenotation
                        </h2>
                        <Form.Group controlId="name">
                            <Form.Label>Your name</Form.Label>
                            <Form.Control type="text" name="name" value={name} onChange={(ev) => updateNameField(ev.target.value)} required autoFocus autoComplete ="off"/>
                        </Form.Group>

                        <Form.Group controlId="surname">
                            <Form.Label>Your surname</Form.Label>
                            <Form.Control type="text" name="surname" value={surname} onChange={(ev) => updateSurnameField(ev.target.value)} required autoFocus autoComplete ="off"/>
                        </Form.Group>

                        <Form.Group controlId="ccn">
                            <Form.Label>Card Number</Form.Label>
                            <Form.Control name="ccn" value={cardNumber} type="tel" pattern="[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}"  maxLength="19" placeholder="xxxx-xxxx-xxxx-xxxx" onChange={(ev) => updateCardNumberField(ev.target.value)} required autoFocus autoComplete ="off"/>
                        </Form.Group>

                        <Form.Group controlId="cvv">
                            <Form.Label>CVV</Form.Label>
                            <Form.Control name="cvv" value={cvv} type="tel" pattern="[0-9]{3}"  maxLength="3" placeholder="cvv" onChange={(ev) => updateCvvField(ev.target.value)} required autoFocus autoComplete ="off"/>
                        </Form.Group>
                
                        <Form.Group controlId='paymentBtn'>
                            <Row>
                                <Col>
                                    <Button variant="dark" type="submit" disabled={waitingPayment}>
                                        Confirm
                                    </Button>
                                </Col>
                                <Col>
                                    { (waitingPayment === true && paymentStatus.message === '') && <Loading loadingMessage={" Wait for the payment to complete"}></Loading> }
                                </Col>
                            </Row>
                        </Form.Group>
                    </Col>
                </Row>
            </Container>
        </Form>
        </>
    );
}


const ModalPayment = (props) =>
{
    const [show, setShow] = useState(true);
  
    const handleClose = () =>
    {
        setShow(false);
        props.finalizePrenotation(props.paymentStatus.error);
    }
  
    return ( 
        <Modal show={show} animation={false} onHide={handleClose}>
            <Modal.Header variant="dark" closeButton className="modal-header bg-info">
                <Modal.Title>Payment summary</Modal.Title>
            </Modal.Header>
            <Modal.Body>{props.paymentStatus.message}</Modal.Body>
            <Modal.Footer>
                <Button variant="dark" onClick={handleClose}>
                Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

export default PayForm;
