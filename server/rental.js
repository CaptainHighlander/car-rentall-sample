'use strict';

const createRental = (rental) => 
{
  return new Rental(rental.ID, rental.Category, rental.StartDate, rental.EndDate, rental.AdditionalDrivers, rental.EstimatedKm, rental.ExtraInsurance);
}

class Rental
{
   constructor(id, category, startDate, endDate, additionalDrivers, estimatedKm, extraInsurance) 
   {
      this.id = id;
      this.category = category;
      this.startDate = startDate;
      this.endDate = endDate;
      this.additionalDrivers = additionalDrivers;
      this.estimatedKm = estimatedKm;
      if(estimatedKm !== "Unlimited")
      {
         this.estimatedKm += " km/days";
      }
      this.extraInsurance = (extraInsurance === 1) ? "yes" : "no";
   }
}

module.exports = createRental;
