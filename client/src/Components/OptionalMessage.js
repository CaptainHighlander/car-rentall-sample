import React from 'react';

//#region React-Bootstrap components
import Alert from 'react-bootstrap/Alert';
import { EmojiSmile, EmojiFrown, EmojiAngry } from 'react-bootstrap-icons'
//#endregion

const OptionalMsg = (props) => 
{
    return(
        <Alert variant={props.variant}>
            <Alert.Heading>{props.headerText}</Alert.Heading>
            <p>{props.msgText}</p>
            { props.variant === 'info' && <EmojiSmile className="ml-4" size = '300'></EmojiSmile> } 
            { props.variant === 'warning' && <EmojiFrown className="ml-4" size = '300'></EmojiFrown> }
            { props.variant === 'danger' && <EmojiAngry className="ml-4" size = '100'></EmojiAngry> }
        </Alert>
    );
}

export default OptionalMsg;
