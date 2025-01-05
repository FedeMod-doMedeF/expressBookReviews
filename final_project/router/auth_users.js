const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
  for (let user of users) {
    if (user.username === username) {
        return true;
    }
  }
}

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password);
  });
  if (validusers.length > 0) {
      return true;
  } else {
      return false;
  }

}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
      return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign({
        username: username
      }, 'secret_key', { expiresIn: 60*10}); // 10 min

      req.session.authorization = {
          accessToken, username
      }
      return res.status(200).json({ message: `User ${username} successfully logged in | generated token: ${accessToken}` });
  } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.query;
  const userInSession = req.user;
  if (books[isbn]) {
    if (!books[isbn].reviews[userInSession]) {
      books[isbn].reviews[userInSession] = review;
      return res.status(200).json({ message: `Review added for book with ISBN ${isbn}` });
    } else {
      let previousReviewValue = books[isbn].reviews[userInSession];
      books[isbn].reviews[userInSession] = review;
      return res.status(200).json({ message: `Review updated for book with ISBN ${isbn} for user: ${userInSession} \nfrom "${previousReviewValue}" to ${books[isbn].reviews[userInSession]}` });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

//delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const userInSession = req.user; 

  if (books[isbn]) {
    if (books[isbn].reviews[userInSession]) {
      delete books[isbn].reviews[userInSession];

      return res.status(200).json({
        message: `User: ${userInSession} Review deleted for book with ISBN ${isbn}`,
      });
    } else {
      return res.status(404).json({
        message: `No review found for user ${userInSession} on the specified book`,
      });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
