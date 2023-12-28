'use strict';
const moment = require('moment');

//#region My Class
const createRental = require('../rental.js');
//#endregion

const sqlite = require('sqlite3');
const database = new sqlite.Database('./database/CH_CarRental.sqlite', (err) => 
{
   if (err)
   { 
      throw err;
   }
});

const MIN_RENTALS_FREQUENT_USER = 3;
const PERCENTANGE_FEW_VEHICLES = 10;
const PRICE_LIST =
{
   //Eur
   CategoryA: 80,
   CategoryB: 70,
   CategoryC: 60,
   CategoryD: 50,
   CategoryE: 40,
   //Percentanges
   LessThan50KmPerDay: -5,
   LessThan150KmPerDay: 0,
   UnlimitedKmPerDay: 5,
   Under25: 5,
   Over65: 10,
   ExtraDrivers: 15,
   ExtraInsurance: 20,
   FrequentCustomer: -10, //At least more than 3 rentals done
   FewVehicles: 10, //Less than 10% vehicles in the same categories are left in the garage in the days of the rental
}

exports.getRentalPrice = function(rentalData) 
{
   return new Promise((resolve, reject) => 
   {
      let price = 0;
      let variations = 0;
      //#region Base price
      switch(rentalData.category)
      {
         case 'A':
            price = PRICE_LIST.CategoryA;
            break;
         case 'B':
            price = PRICE_LIST.CategoryB;
            break;
         case 'C':
            price = PRICE_LIST.CategoryC;
            break;
         case 'D':
            price = PRICE_LIST.CategoryD;
            break;
         case 'E':
            price = PRICE_LIST.CategoryE;
            break;
         default:
            price = PRICE_LIST.CategoryA;
            break;
      }
      price *= rentalData.numberOfDays;
      //#endregion

      //#region Calculation of the price variation 
      // -- how much km/days?
      if(rentalData.estimatedKm <= 50)
      {
         variations += PRICE_LIST.LessThan50KmPerDay;
      }
      else if(rentalData.estimatedKm <= 150)
      {
         variations += PRICE_LIST.LessThan150KmPerDay;
      }
      else
      {
         variations += PRICE_LIST.UnlimitedKmPerDay;
      }
      // -- age: is user younger or older?
      if(rentalData.age <= 25)
      {
         variations += PRICE_LIST.Under25;
      }
      else if(rentalData.age >= 65)
      {
         variations += PRICE_LIST.Over65;
      }
      // -- is there any extra driver?
      if(rentalData.extraDrivers >= 1)
      {
         variations += PRICE_LIST.ExtraDrivers;
      }
      // -- does user want an extra insurance?
      if(rentalData.extraInsurance === true || rentalData.extraInsurance === "true")
      {
         variations += PRICE_LIST.ExtraInsurance;
      }
      // -- is user a frequent customer?
      if(rentalData.numberOfRentals >= MIN_RENTALS_FREQUENT_USER)
      {
         variations += PRICE_LIST.FrequentCustomer;
      }
      // -- are there few vehicles in the same categories in the days of the rental?
      if(rentalData.percentageOfVehiclesLeft <= PERCENTANGE_FEW_VEHICLES)
      {
         variations += PRICE_LIST.FewVehicles;
      }
      //#endregion
      
      //Final price:
      price = price * (1 + variations / 100);
      price = price.toFixed(2);
      resolve({price: price});
   });
};

exports.addRental = function (rental, userID) 
{
   return new Promise((resolve, reject) => 
   {
      const extraInsurance = (rental.extraInsurance === true);
      const sql = "INSERT INTO " +
                  "RENTALS(IDUser, Category, StartDate, EndDate, AgeOfDriver, AdditionalDrivers, EstimatedKm, ExtraInsurance) " +
                  "VALUES(?, ?, ?, ?, ?, ?, ?, ?)";
      database.run(sql, [userID, rental.category, rental.startDate, rental.endDate, rental.age, rental.extraDrivers, rental.estimatedKm, extraInsurance], function (err) 
      {
         if (err) 
         {
            reject(err);
            return;
         }
         resolve(this.lastID);
      });
   });
 };

 exports.getAllUserRentals = function(userID) 
{
   return new Promise((resolve, reject) => 
   {
      const sql = "SELECT * " +
                  "FROM RENTALS " +
                  "WHERE IDUser = ? " + 
                  "ORDER BY StartDate, EndDate, Category";
      database.all(sql, [userID], (err, rows) =>
      {
         if (err)
         {
            reject(err);
            return;
         }
         const rentals = rows.map((r) => (createRental(r)));
         resolve(rentals);
      });
   });
};

exports.deleteFutureRental = function (id, userID) 
{
   return new Promise((resolve, reject) => 
   {
      const now = moment().format('YYYY-MM-DD'); //In order to remove the rental only if it's a future rental.
      const sql = "DELETE FROM RENTALS " + 
                  "WHERE ID = ? AND IDUser = ? AND StartDate > ?";
      database.run(sql, [id, userID, now], (err) => 
      {
         if (err) 
         {
            reject(err);
            return;
         } 
         resolve(null);
      });
   });
}
