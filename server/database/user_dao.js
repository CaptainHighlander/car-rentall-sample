'use strict';

//#region My Class
const createUser = require('../user.js');
//#endregion

const bcrypt = require('bcrypt');
const sqlite = require('sqlite3');
const database = new sqlite.Database('./database/CH_CarRental.sqlite', (err) => 
{
   if (err)
   { 
      throw err;
   }
});

exports.getUser = function (email) 
{
   return new Promise((resolve, reject) => 
   {
      const sql = "SELECT * " + 
                  "FROM USERS " + 
                  "WHERE Email = ?";
      database.all(sql, [email], (err, rows) => 
      {
         if (err) 
         {
            reject(err);
            return;
         }
         else if (rows.length === 0) 
         {
            resolve(undefined); //Email not found.
            return;
         }
         else
         {
            const user = createUser(rows[0]);
            resolve(user);
         }
      });
   });
};

exports.checkPassword = function(user, password)
{
   return bcrypt.compareSync(password, user.hash_password);
}

exports.loadUserInfo = function (userID) 
{
   return new Promise((resolve, reject) => 
   {
      const sql = "SELECT Email, Name, Surname, Rentals " + 
                  "FROM USERS " + 
                  "WHERE Email = ?";
      database.all(sql, [userID], (err, rows) => 
      {
         if (err) 
         {
            reject(err);
            return;
         }
         if (rows.length === 0) 
         {
            reject(null);
            return;
         }
         else
         {
            const user = createUser(rows[0]);
            resolve(user);
         }
      });
   });
 }

 exports.updateUserRentals = function (userID, variation) 
{
   return new Promise((resolve, reject) => 
   {
      //Get current rentals
      const query1 = "SELECT Rentals " +
                     "FROM USERS " + 
                     "WHERE Email = ?";
      database.get(query1, [userID], (err1, row1) => 
      {
         if (err1) 
         {
            reject(err1);
            return;
         }
         if (row1.length === 0) 
         {
            reject(null);
            return;
         }

         //Updating
         const rentals = row1.Rentals + variation;
         const query2 = "UPDATE USERS " +
                        "SET Rentals=? " +
                        "WHERE Email = ?"
         database.run(query2, [rentals, userID], function (err2) 
         {
            if (err2) 
            {
               reject(err2);
               return;
            }
            resolve(this.lastID);
         });
      });
   })
};
