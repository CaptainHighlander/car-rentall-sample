'use strict';

//#region My Class
const generateVehicle = require('../vehicle.js');
//#endregion

const sqlite = require('sqlite3');
const database = new sqlite.Database('./database/CH_CarRental.sqlite', (err) => 
{
   if (err)
   { 
      throw err;
   }
});

exports.getAllVehicles = function() 
{
   return new Promise((resolve, reject) => 
   {
      const sql = "SELECT * " +
                  "FROM VEHICLES " +
                  "ORDER BY Category, Brand, Model";
      database.all(sql, [], (err, rows) =>
      {
         if (err)
         {
            reject(err);
            return;
         }

         const vehicles = rows.map((v) => (generateVehicle(v)));
         resolve(vehicles);
      });
   });
};

exports.getNumberVehiclesByCategory = function(category) 
{
   return new Promise((resolve, reject) => 
   {
      const sql = "SELECT COUNT(*) AS TotVehicles " +
                  "FROM VEHICLES " +
                  "WHERE Category = ?";
      database.get(sql, [category], (err, row) =>
      {
         if (err)
         {
            reject(err);
            return;
         }
         resolve(row);
      });
   });
};

exports.getAvailableVehiclesNumber = function(category, startDate, endDate) 
{
   return new Promise((resolve, reject) => 
   {
      let total = 0;
      let reserved = 0;
      let availability = 0;

      const query1 = "SELECT COUNT(*) AS Total " +
                     "FROM VEHICLES " +
                     "WHERE Category = ?";
      database.get(query1, [category], (err, row) =>
      {
         if (err)
         {
            reject(err);
            return;
         }
         total = row.Total;

         const query2 = "SELECT COUNT(*) AS Reserved " +
                        "FROM RENTALS " +
                        "WHERE Category = ? AND EndDate >= ? AND StartDate <= ?";
         database.get(query2, [category, startDate, endDate], (err2, row2) =>
         {
            if (err2)
            {
               reject(err2);
               return;
            }
            reserved = row2.Reserved;

            availability = total - reserved;
            resolve({ Availability: availability });
         });
      });
   });
};