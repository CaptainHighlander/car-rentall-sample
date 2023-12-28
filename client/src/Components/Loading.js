import React from 'react';

//#region React-Bootstrap components
import Spinner from 'react-bootstrap/Spinner';
//#endregion

const Loading = (props) =>
{
   return (
      <>
      <Spinner animation="border" role="status" variant="primary"></Spinner>
      <strong>{props.loadingMessage}</strong>
      </>
   );
};

export default Loading;
