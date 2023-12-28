import React from 'react';

const VehiclesListRow = (props) => 
{
  return (
    <tr>
      <td>{props.number}</td>
      <td>{props.vehicle.category}</td>
      <td>{props.vehicle.brand}</td>
      <td>{props.vehicle.model}</td>
    </tr>
  );
}

export default VehiclesListRow;
