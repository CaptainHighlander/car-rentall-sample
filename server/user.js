'use strict';

const createUser = (user) => 
{
  return new User(user.Email, user.Name, user.Surname, user.Rentals, user.HashPassword);
}

class User
{
   constructor(email, name, surname, rentals, hash_password) 
   {
      this.email = email;
      this.name = name;
      this.surname = surname;
      this.rentals = rentals;
      if(hash_password)
         this.hash_password = hash_password;
   }
}

module.exports = createUser;
