import React, { useState, useRef } from 'react';
import API from '../../API/Api'
import { Redirect } from 'react-router-dom';

//#region React-Bootstrap components
import Button from'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
//#endregion

//#region My components:
import OptionalMessage from '../../Components/OptionalMessage';
//#endregion
//import validator from 'validator';

const HEADER_MESSAGE_NO_ELEMENTS = "UNAUTHORIZED!";
const TEXT_MESSAGE_NO_ELEMENTS  = "Wrong username and/or password!";

const Login = (props) => 
{
    const [loginSuccess, setLoginSuccess] = useState(false);
    const [waitingLogin, setWaitingLogin] = useState(false);
    const [wrongLoginMsg, setWrongLoginMsg] = useState(false);

    const tryLogin = (user, pass) => 
    {
        setWaitingLogin(true);
        API.login(user, pass).then((userObj) => 
        {
            setWaitingLogin(false);
            setLoginSuccess(true);  

            // Do this as the last operation
            // since it will cause the component to be unmounted (not rendered anymore in App)
            // otherwise, other set state methods will give a warning (component unmounted)
            props.login(userObj);  
        })
        .catch(() => 
        {
            setWrongLoginMsg(true);
            setWaitingLogin(false);
        });
    }

    if (loginSuccess) 
    {
        return (
            //Since setState is async and can be delayed, this 'state:' is guaranteed to be immediately available to the new Route in props.location.state
            <Redirect to={ {pathname: '/rental', state: { isLoggedIn: true } }}></Redirect>
        );
    } 
    else
        return (
        <>
            <LoginForm tryLogin={tryLogin} waitingLogin={waitingLogin}></LoginForm>
            { (wrongLoginMsg) && <Container fluid><Container><Container><OptionalMessage variant="danger" headerText={HEADER_MESSAGE_NO_ELEMENTS} msgText={TEXT_MESSAGE_NO_ELEMENTS}></OptionalMessage></Container></Container></Container> }
        </>);
}

function LoginForm(props) 
{
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const formRef = useRef();

    const updateEmailField = (value) => 
    {
        setEmail(value);
    }

    const updatePasswordField = (value) => 
    {
        setPassword(value);
    }

    const doLogin = (event) => 
    {
        event.preventDefault();
        if (formRef.current.checkValidity()) 
        {
            props.tryLogin(email, password);
        } 
        else 
        {
            formRef.current.reportValidity();
        }
    }

    return (
        <Form className="below-nav" ref={formRef} onSubmit={doLogin}>
            <Container>
                <Form.Group controlId="email">
                    <Form.Label>Your email</Form.Label>
                    <Form.Control type="email" name="email" placeholder="name@example.com" value = {email} onChange={(ev) => updateEmailField(ev.target.value)} required autoFocus autoComplete ="off"/>
                </Form.Group>

                <Form.Group controlId="password">
                    <Form.Label>Your password</Form.Label>
                    <Form.Control type="password" name="password" minLength='4' value = {password} onChange={(ev) => updatePasswordField(ev.target.value)} required autoFocus/>
                </Form.Group>
        
                <Form.Group controlId='loginBtn'>
                    <Button variant="dark" type="submit" disabled={props.waitingLogin}>
                        Login
                    </Button>
                </Form.Group>
            </Container>
        </Form>
    );
}

export default Login;
