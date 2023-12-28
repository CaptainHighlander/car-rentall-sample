const BASEURL = '/api' ;
const CONNECTION_ERRORS_OBJ = { errors: [{ param: "Server", msg: "Cannot communicate" }] };
const APPLICATION_ERROR_OBJ = { errors: [{ param: "Application", msg: "Cannot parse server response" }] };

//#region Authetication:
async function login(username, password) 
{
   return new Promise((resolve, reject) => 
   {
      fetch(BASEURL + '/login', 
      {
         method: 'POST', 
         headers: { 'Content-Type': 'application/json', },
         body: JSON.stringify({username: username, password: password}),
      })
      .then((response) => 
      {
         if (response.ok) 
         {
            response.json()
                    .then((obj) => { resolve(obj); }) 
                    .catch((err) => { reject(APPLICATION_ERROR_OBJ); }); 
         } 
         else //Analyze the cause of error
         {
            response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject(APPLICATION_ERROR_OBJ); }); 
         }
      })
      .catch((err) => { reject(CONNECTION_ERRORS_OBJ); }); 
   });
}

async function getCSRFToken() 
{
   return new Promise((resolve, reject) => 
   {
      fetch(BASEURL + '/csrf-token').then((response) => 
      {
         if (response.ok) 
         {
            response.json()
                    .then((obj) => { resolve(obj); }) 
                    .catch((err) => { reject(APPLICATION_ERROR_OBJ) }); 
         } 
         else //Analyze the cause of error 
         {
            response.json()
                    .then((obj) => { reject(obj); }) // error msg in the response body
                    .catch((err) => { reject(APPLICATION_ERROR_OBJ) }); 
         }
       }).catch((err) => { reject(CONNECTION_ERRORS_OBJ) }); 
   });
}

async function userLogout() 
{
   return new Promise((resolve, reject) => 
   {
      fetch(BASEURL + '/logout', 
      {
         method: 'POST', 
         headers: { 'Content-Type': 'application/json', },
         body: JSON.stringify({}),
      })
      .then((response) => 
      {
         if (response.ok) 
         {
            resolve(null);
         } 
         else 
         {
            reject(null);
         }
      })
      .catch((err) => { reject(CONNECTION_ERRORS_OBJ) }); 
   });
}

async function isUserAutheticated() 
{
   return new Promise((resolve, reject) => 
   {
      fetch(BASEURL + '/users', 
      {
         method: 'GET',
      })
      .then((response) => 
      {
         const status = response.status;
         if (response.ok) 
         {
            response.json()
                    .then((userObj) => { resolve(userObj) } )
                    .catch((err) => { reject(APPLICATION_ERROR_OBJ) }); 
         } 
         else //Analyze the cause of error
         {
            response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject(APPLICATION_ERROR_OBJ) }); 
         }
      })
      .catch((err) => { reject(CONNECTION_ERRORS_OBJ) });
   });
}
//#endregion


// call REST API : GET /vehicles
async function getAllVehicles() 
{
   return new Promise((resolve, reject) => 
   {
      fetch(BASEURL + '/vehicles', 
      {
         method: 'GET',
      })
      .then((response) => 
      {
         const status = response.status;
         if (response.ok) 
         {      
            response.json()
                    .then((obj) => { resolve(obj); }) 
                    .catch((err) => { reject(err); }); 
         } 
         else //Analyze the cause of error
         {
            response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject(APPLICATION_ERROR_OBJ); }); 
         }
      })
      .catch((err) => { reject(CONNECTION_ERRORS_OBJ); }); 
   });
}

// call REST API : GET /vehicles?params
async function getAvailableVehiclesNumber(category, startDate, endDate) 
{
   const params = "?category=" + category + "&startDate=" + startDate + "&endDate=" + endDate;
   return new Promise((resolve, reject) => 
   {
      fetch(BASEURL + '/vehicles' + params, 
      {
         method: 'GET',
      })
      .then((response) => 
      {
         const status = response.status;
         if (response.ok) 
         {      
            response.json()
                    .then((obj) => { resolve(obj); }) 
                    .catch((err) => { reject(err); }); 
         } 
         else //Analyze the cause of error
         {
            response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject(APPLICATION_ERROR_OBJ); }); 
         }
      })
      .catch((err) => { reject(CONNECTION_ERRORS_OBJ); }); 
   });
}

// call REST API : GET /prices
async function getPriceQuotation(rentalParams) 
{
   //eg --> ?category=A&age=18&startDate=2020-06-21&endDate=2020-06-24&extraDrivers=1&extraInsurance=true&estimatedKm=150&numberOfRentals=3
   const params = "?category=" + rentalParams.category + "&age=" + rentalParams.age + "&startDate=" + rentalParams.startDate +
                  "&endDate=" + rentalParams.endDate + "&extraDrivers=" + rentalParams.extraDrivers +
                  "&extraInsurance=" + rentalParams.extraInsurance + "&estimatedKm=" + rentalParams.estimatedKm + "&numberOfRentals=" + rentalParams.numberOfRentals;

   return new Promise((resolve, reject) => 
   {
      fetch(BASEURL + '/prices' + params, 
      {
         method: 'GET',
      })
      .then((response) => 
      {
         const status = response.status;
         if (response.ok) 
         {      
            response.json()
                    .then((obj) => { resolve(obj); }) 
                    .catch((err) => { reject(err); }); 
         } 
         else //Analyze the cause of error
         {
            response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject(APPLICATION_ERROR_OBJ); }); 
         }
      })
      .catch((err) => { reject(CONNECTION_ERRORS_OBJ); }); 
   });
}

// call REST API : POST /reservations
async function doReservation(reservationInfo, csrfToken) 
{
   return new Promise((resolve, reject) => 
   {
      fetch(BASEURL + '/reservations', 
      {
         method: 'POST',
         headers: 
         {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
         },
         body: JSON.stringify(reservationInfo),
      })
      .then((response) => 
      {
         const status = response.status;
         if (response.ok) 
         {
            resolve(null);
         } 
         else //Analyze the cause of error
         {
            response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject(APPLICATION_ERROR_OBJ) }); 
         }
      }).catch((err) => { reject(CONNECTION_ERRORS_OBJ) }); 
   });
}

// call REST API : POST /payments
async function newPayment(payment, csrfToken) 
{
   return new Promise((resolve, reject) => 
   {
      fetch(BASEURL + '/payments', 
      {
         method: 'POST',
         headers: 
         {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
         },
         body: JSON.stringify(payment),
      })
      .then((response) => 
      {
         const status = response.status;
         if (response.ok) 
         {
            resolve(null);
         } 
         else //Analyze the cause of error
         {
            response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject(APPLICATION_ERROR_OBJ) }); 
         }
      }).catch((err) => { reject(CONNECTION_ERRORS_OBJ) }); 
   });
}

// call REST API : POST /rentals
async function addRental(rental, csrfToken) 
{
   return new Promise((resolve, reject) => 
   {
      fetch(BASEURL + '/rentals', 
      {
         method: 'POST',
         headers: 
         {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
         },
         body: JSON.stringify(rental),
      })
      .then((response) => 
      {
         const status = response.status;
         if (response.ok) 
         {
            resolve(null);
         } 
         else //Analyze the cause of error
         {
            response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject(APPLICATION_ERROR_OBJ) }); 
         }
      }).catch((err) => { reject(CONNECTION_ERRORS_OBJ) }); 
   });
}

// call REST API : GET /rentals?period=
async function getUserRentals(period, csrfToken) 
{
   const params = "?period=" + period;
   return new Promise((resolve, reject) => 
   {
      fetch(BASEURL + '/rentals' + params, 
      {
         method: 'GET',
         'X-CSRF-Token': csrfToken,
      })
      .then((response) => 
      {
         const status = response.status;
         if (response.ok) 
         {      
            response.json()
                    .then((obj) => { resolve(obj); }) 
                    .catch((err) => { reject(err); }); 
         } 
         else //Analyze the cause of error
         {
            response.json()
                    .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                    .catch((err) => { reject(APPLICATION_ERROR_OBJ); }); 
         }
      })
      .catch((err) => { reject(CONNECTION_ERRORS_OBJ); }); 
   });
}

// call REST API : DELETE /rentals/:id
async function deleteRental(id, csrfToken) 
{
   return new Promise((resolve, reject) => 
   {
      fetch(BASEURL + '/rentals/' + id, 
      {
         method: 'DELETE',
         headers: 
         {
            'X-CSRF-Token': csrfToken,
         },
      })
      .then((response) => {
         const status = response.status;
         if (response.ok) 
         {
            resolve(null);
         } 
         else 
         {
            // analyze the cause of error
            response.json()
                   .then((obj) => { obj.status = status; reject(obj); }) // error msg in the response body
                   .catch((err) => { reject(APPLICATION_ERROR_OBJ) }); 
         }
      })
      .catch((err) => { reject(CONNECTION_ERRORS_OBJ) });
   });
}

const API = { login, getCSRFToken, userLogout, isUserAutheticated, getAllVehicles, getAvailableVehiclesNumber, getPriceQuotation, doReservation, newPayment, addRental, getUserRentals, deleteRental } ;
export default API;