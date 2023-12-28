import React from 'react';

//#region My components:
import OptionalMessage from '../OptionalMessage'
import VehiclesListRow from './VehiclesListRow'
//#endregion

//#region React-Bootstrap components
import Table from 'react-bootstrap/Table';
//#endregion

const HEADER_MESSAGE_HELLO = "Hey, nice to see you!";
const TEXT_MESSAGE_HELLO = "Please, select what you would like to view";

const HEADER_MESSAGE_NO_ELEMENTS = "Ops!";
const TEXT_MESSAGE_NO_ELEMENTS  = "Sorry, no results found!";

const VehiclesList = (props) => 
{
   let lastKey = 1;
   if(Array.isArray(props.list) && props.list.length >= 1) 
   {
      return (
         <Table striped bordered hover variant="primary">
            <thead>
               <tr>
                  <th>#</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Model</th>
               </tr>
            </thead>
            <tbody>
               { props.list.map((vehicle) => <VehiclesListRow key={lastKey} number={lastKey++} vehicle={vehicle}></VehiclesListRow>) }
            </tbody>
         </Table>
      )
   }
   else
   {
      if(props.filtering === true)
      {
         return(
            <OptionalMessage variant="warning" headerText={HEADER_MESSAGE_NO_ELEMENTS} msgText={TEXT_MESSAGE_NO_ELEMENTS}></OptionalMessage>
         );
      }
      return (
         <OptionalMessage variant="info" headerText={HEADER_MESSAGE_HELLO} msgText={TEXT_MESSAGE_HELLO}></OptionalMessage>
      );
   }
}

export default VehiclesList;
