'use strict';

const generateVehicle = (vehicle) => 
{
  return new Vehicle(vehicle.Category, vehicle.Brand, vehicle.Model);
}

class Vehicle
{
   constructor(category, brand, model, availability) 
   {
      this.category = category;
      this.brand = brand;
      this.model = model;
   }
}

module.exports = generateVehicle;
