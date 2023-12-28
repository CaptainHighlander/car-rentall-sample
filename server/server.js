const express = require('express');
const morgan = require('morgan'); 
const jwt = require('express-jwt');
const jsonwebtoken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const { check, validationResult } = require('express-validator');
const validator = require('validator');
const moment = require('moment');

//#region DAO
const vehicleDao = require('./database/vehicle_dao');
const userDao = require('./database/user_dao');
const rentalsDao = require('./database/rentals_dao');
//#endregion

const jwtSecretContent = require('./secret.js');
const jwtSecret = jwtSecretContent.jwtSecret;

const PORT = 3001;
const BASEURI = '/api' ;

app = new express();
app.use(morgan('tiny'));
app.use(express.json());

//#region Errors 
const OK = 200;
const CREATED = 201;
const NoContent = 204;
const BadRequest = 400;
const Unauthorized = 401;
const UnprocessableEntity = 422;
const InternalServerError = 500;
const ServiceUnavailable  = 503;
const dbErrorObj = { errors: [{ 'param': 'Server', 'msg': 'Database error' }] };
const authErrorObj = { errors: [{ 'param': 'Server', 'msg': 'Authorization error' }] };
const authErrorObj_email = { errors: [{ 'param': 'Server', 'msg': 'Invalid e-mail' }] };
const authErrorObj_password = { errors: [{ 'param': 'Server', 'msg': 'Wrong password' }] };
const WrongQueryFormatErrorObj = { errors: [{ 'param': 'Server', 'msg': 'Wrong query params format' }] };
const DateErrorObj_invalid = { errors: [{ 'param': 'Server', 'msg': 'Invalid date' }] };
const DateErrorObj_missing = { errors: [{ 'param': 'Server', 'msg': 'Missing date' }] };
const MissingFullNameErrorObj = { errors: [{ 'param': 'Server', 'msg': 'Missing full name' }] };
//#endregion
const MAX_EXTRA_DRIVERS = 10;
const VALID_DATES = 0;

//#region Utility functions
const checkDates = (startDate, endDate) =>
{
   if(validator.isDate(startDate) === false || validator.isDate(endDate) === false)
      return 1;
   
   //No past dates
   const now = moment().format('YYYY-MM-DD');
   if(moment(now).isAfter(startDate) === true || moment(now).isAfter(endDate) === true)
      return 2;

   //Start date MUST come before end date.
   return (moment(startDate).isBefore(endDate)) ? VALID_DATES : 3;
}

const calculatePrice = (res, req_params, priceBeforeCalculated) =>
{
   vehicleDao
   .getNumberVehiclesByCategory(req_params.category)
   .then((vehiclesNumberObj) => 
   {
      if(vehiclesNumberObj.TotVehicles === 0)
      {
         if(!priceBeforeCalculated)
            return res.status(NoContent).end();
         else
            return res.status(BadRequest).end();
      }   
      vehicleDao
      .getAvailableVehiclesNumber(req_params.category, req_params.startDate, req_params.endDate) 
      .then((availableVehiclesNumberObj) =>
      {
         if(availableVehiclesNumberObj.Availability === 0)
         {
            return res.status(ServiceUnavailable).json(dbErrorObj);
         }

         //#region Price calculation:
         //Calculate the number of days:
         const days = moment(req_params.endDate).diff(moment(req_params.startDate), 'days');
         //Calculate the percentange of vehicles left. 
         const left = (availableVehiclesNumberObj.Availability / vehiclesNumberObj.TotVehicles) * 100;

         //Creation of an object containing the params of the required rental
         const rentalData =
         {
            category: req_params.category,
            age: req_params.age,
            numberOfDays: days,
            extraDrivers: req_params.extraDrivers,
            extraInsurance: req_params.extraInsurance,
            estimatedKm: req_params.estimatedKm,
            numberOfRentals: req_params.numberOfRentals,
            percentageOfVehiclesLeft: left,
         }
         rentalsDao.getRentalPrice(rentalData)
                   .then((priceObj) => 
                   {
                     if(!priceBeforeCalculated)
                     {
                        res.status(OK).json(priceObj);
                     }
                     else //Confirm price received
                     {
                        if(priceObj.price === priceBeforeCalculated)
                        {
                           res.status(OK).json(priceObj);
                        }
                        else
                        {
                           res.status(BadRequest).end();
                        }
                     }
                   })
                   .catch((err) => {res.status(ServiceUnavailable).json(dbErrorObj)});
         //#endregion
      })
      .catch((err) => res.status(ServiceUnavailable).json(dbErrorObj));             
   })
   .catch((err) => res.status(ServiceUnavailable).json(dbErrorObj));
}
//#endregion


//#region Authentication
const expireTime = 3600; //seconds (= 60 minutes)

app.post(BASEURI + '/login', (req, res) => 
{
   const username = req.body.username;
   const password = req.body.password;
   userDao.getUser(username).then((userObj) => 
   {
      if(userObj === undefined) //Inserted email doesn't exist
      {
         res.status(Unauthorized).send(authErrorObj_email);
      } 
      else 
      {
         if(userDao.checkPassword(userObj, password) === false) //Inserted password doesn't corresponding.
         {
            res.status(Unauthorized).send(authErrorObj_password); 
         } 
         else 
         {
            //AUTHENTICATION SUCCESS
            delete userObj.hash_password;
            const token = jsonwebtoken.sign({ userID: userObj.email }, jwtSecret, {expiresIn: expireTime});
            res.cookie('tokenCH', token, { httpOnly: true, sameSite: true, maxAge: 1000*expireTime });
            res.status(OK).json(userObj);
         }
      } 
   }) //Delay response when wrong user/pass is sent to avoid fast guessing attempts
   .catch((err) => new Promise((resolve) => setTimeout(resolve, 1000)).then(() => res.status(Unauthorized).json(authErrorObj)));
});

app.use(cookieParser());

const csrfProtection = csrf({ cookie: { httpOnly: true, sameSite: true } });

app.post(BASEURI + '/logout', (req, res) => 
{ 
   res.clearCookie('tokenCH');
   res.status(OK).json('User Logged out')
});
//#endregion

//#region Public APIs (no authetication required)
app.get(BASEURI + '/vehicles', (req, res) => 
{
   if(req.query.category && req.query.startDate && req.query.endDate)
   {
      if(validator.isDate(req.query.startDate) === false || validator.isDate(req.query.endDate) === false)
      {
         res.status(UnprocessableEntity).send(WrongQueryFormatErrorObj);
      }
      vehicleDao.getAvailableVehiclesNumber(req.query.category, req.query.startDate, req.query.endDate)
                .then((vehiclesNumberObj) => res.status(OK).json(vehiclesNumberObj))
                .catch((err) => res.status(ServiceUnavailable).json(dbErrorObj));
   }
   else if(!req.query.category && !req.query.startDate && !req.query.endDate)
   {
      vehicleDao.getAllVehicles()
                .then((vehiclesObj) => res.status(OK).json(vehiclesObj))
                .catch((err) => res.status(ServiceUnavailable).json(dbErrorObj));
   }
   else
   {
      res.status(BadRequest).end();
   }
 });

app.get(BASEURI + '/prices', 
[
   check('category').isAscii(),
   check('age').isInt({ min: 18, max: 80 }),
   check('extraDrivers').isInt({ min: 0, max: MAX_EXTRA_DRIVERS }),
   check('extraInsurance').isBoolean(),
   check('numberOfRentals').isInt({ min: 0 }),
],(req, res) => 
{
   const errors = validationResult(req);
   if (errors.isEmpty() === false)
   {
      return res.status(UnprocessableEntity).json({ errors: errors.array() });
   }  
   //Other checks
   if(req.query.startDate && req.query.endDate)
   {
      if(checkDates(req.query.startDate, req.query.endDate) !== VALID_DATES)
      {
         res.status(UnprocessableEntity).send(DateErrorObj_invalid);
      }
   }
   else
   {
      return res.status(UnprocessableEntity).send(DateErrorObj_missing);
   }
   if(validator.isInt(req.query.estimatedKm, {min: 1}) === false && req.query.estimatedKm !== 'Unlimited')
   {
      return res.status(UnprocessableEntity).end();
   }

   calculatePrice(res, req.query);
});
//#endregion

//With the following line, for the rest of the code, all APIs require authentication
app.use(jwt({ secret: jwtSecret, getToken: req => req.cookies.tokenCH }) );

//#region APIs that require authentication
app.get(BASEURI + '/csrf-token', csrfProtection, (req, res) => 
{
   res.json({ csrfToken: req.csrfToken() });
});

app.get(BASEURI + '/users', (req, res) => 
{
   const userID = req.user && req.user.userID;
   userDao.loadUserInfo(userID)   // Only retrieve user info: jwt would stop if not authorized
          .then((userObj) => { res.json(userObj); })
          .catch((err) => res.status(ServiceUnavailable).json(dbErrorObj));
});

app.post(BASEURI + '/reservations', csrfProtection, 
[
   check('category').isAscii(),
   check('age').isInt({ min: 18, max: 80 }),
   check('extraDrivers').isInt({ min: 0, max: MAX_EXTRA_DRIVERS }),
   check('extraInsurance').isBoolean(),
   check('numberOfRentals').isInt({ min: 0 }),
   check('price').isFloat({min: 10.0}), 
], (req, res) => 
{
   const errors = validationResult(req);
   if (errors.isEmpty() === false)
   {
      return res.status(UnprocessableEntity).json({ errors: errors.array() });
   }  
   //Other checks
   if(req.body.startDate && req.body.endDate)
   {
      if(checkDates(req.body.startDate, req.body.endDate) !== VALID_DATES)
      {
         res.status(UnprocessableEntity).send(DateErrorObj_invalid);
      }
   }
   else
   {
      return res.status(UnprocessableEntity).send(DateErrorObj_missing);
   }
   if(validator.isInt(req.body.estimatedKm, {min: 1}) === false && req.body.estimatedKm !== 'Unlimited')
   {
      return res.status(UnprocessableEntity).end();
   }

   // Extract userID from JWT payload
   const userID = req.user && req.user.userID;
   userDao.getUser(userID)
          .then((userObj) =>
          {
            //I am not checking age value to simplify debugging.
            if(userObj.rentals === req.body.numberOfRentals) //&& userObj.age === req.body.age)
            {
               calculatePrice(res, req.body, req.body.price);
            } 
            else
            {
               return res.status(BadRequest).end();
            }
          })
          .catch((err) => res.status);
});

app.post(BASEURI + '/payments', csrfProtection, 
[
   check('CCN').isLength({min:19, max: 19}),
   check('CVV').isNumeric({ no_symbols: true}),
   check('price').isFloat({min: 10.0}), 
], (req, res) => 
{
   const errors = validationResult(req);
   if (errors.isEmpty() === false) 
   {
      return res.status(UnprocessableEntity).json({ errors: errors.array() });
   }
   else if (!req.body.fullName) 
   {
      return res.status(BadRequest).send(MissingFullNameErrorObj);
   } 
   new Promise((resolve) => setTimeout(resolve, 2000)).then(() => res.status(OK).send('Accepted payment (' + req.body.price + ' eur)'));
 });

app.post(BASEURI + '/rentals', csrfProtection, 
[
   check('category').isAscii(),
   check('age').isInt({ min: 18, max: 80 }),
   check('extraDrivers').isInt({ min: 0, max: MAX_EXTRA_DRIVERS }),
   check('extraInsurance').isBoolean(),
], (req, res) => 
{
   const errors = validationResult(req);
   if (errors.isEmpty() === false)
   {
      return res.status(UnprocessableEntity).json({ errors: errors.array() });
   }  
   //Other checks
   if(req.body.startDate && req.body.endDate)
   {
      if(checkDates(req.body.startDate, req.body.endDate) !== VALID_DATES)
      {
         res.status(UnprocessableEntity).send(DateErrorObj_invalid);
      }
   }
   else
   {
      return res.status(UnprocessableEntity).send(DateErrorObj_missing);
   }

   // Extract userID from JWT payload
   const userID = req.user && req.user.userID;
   //Create rental object from body
   const rental = 
   {
      category: req.body.category, 
      startDate: req.body.startDate,
      endDate: req.body.endDate, 
      age: req.body.age, 
      extraDrivers: req.body.extraDrivers,
      estimatedKm: req.body.estimatedKm,
      extraInsurance: req.body.extraInsurance,    
   };
   rentalsDao.addRental(rental, userID)
             .then((result) =>
             { 
               userDao.updateUserRentals(userID, 1) //Add a rental to the current user.
                      .then(() => { res.status(CREATED).end() })
                      .catch((err) => res.status(ServiceUnavailable).json(dbErrorObj));
             })
             .catch((err) => res.status(ServiceUnavailable).json(dbErrorObj));
 });

app.get(BASEURI + '/rentals', csrfProtection, (req, res) => 
{   
   if(req.query.period && ["past", "current", "future"].includes(req.query.period))
   {
      // Extract userID from JWT payload
      const userID = req.user && req.user.userID;

      rentalsDao.getAllUserRentals(userID)
                .then((rentalsObj) => 
                {
                  let filterdRentals;
                  const now = moment().format('YYYY-MM-DD');
                  switch(req.query.period)
                  {
                     case 'past': //Namely rentals having end date prior to today.
                        filterdRentals = rentalsObj.filter((rental) => { return rental.endDate <= now });
                        break;
                     case 'future': //Namely rentals having end date succeding today.
                        filterdRentals = rentalsObj.filter((rental) => { return rental.startDate > now });
                        break;
                     case 'current': //Namely if today is between start date end and date.
                        filterdRentals = rentalsObj.filter((rental) => { return (rental.startDate <= now) && (rental.endDate > now) });
                        break;
                     default: 
                        res.status(InternalServerError).end();
                        break;
                  }
                  res.status(OK).json(filterdRentals)
                })
                .catch((err) => res.status(ServiceUnavailable).json(dbErrorObj));
   }
   else
   {
      res.status(BadRequest).end();
   }   
});

app.delete(BASEURI + '/rentals/:id', csrfProtection, (req, res) => 
{
   //superfluous contol
   if(!req.params.id)
   {
      return res.status(BadRequest).end();
   }
   // Extract userID from JWT payload
   const userID = req.user && req.user.userID;

   rentalsDao.deleteFutureRental(req.params.id, userID)
             .then((result) =>
             { 
               userDao.updateUserRentals(userID, -1) //Remove rental to the current user.
                      .then(() => { res.status(OK).end() })
                      .catch((err) => res.status(ServiceUnavailable).json(dbErrorObj));
             })
             .catch((err) => res.status(ServiceUnavailable).json(dbErrorObj));
});
//#endregion

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));
