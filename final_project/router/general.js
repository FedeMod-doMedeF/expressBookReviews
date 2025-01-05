const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const axios = require('axios');

public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Invalid input" });
  } else {
    if (isValid(username)) {
      return res.status(400).json({ message: "User already exists" });
    } else {
      users.push({ username: username, password: password });
      return res.status(201).json({ message: `User ${username} registered successfully` });
    }
  }
});

// Get users
public_users.get("/users", (req,res) => {
  return res.status(200).json({ message: "Registered users", users: users });
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {

  if (Object.keys(books).length > 0) {
    return res.status(200).send(`Books list in catalogue ${JSON.stringify(books, null, 2)}`);
  } else {
    return res.status(404).json("No books available");
  }

});

async function getBookList() {
  try {
    const response = await axios.get('http://localhost:5001/');
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching books: ", error);
  }
}

getBookList();

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const { isbn } = req.params;
  if(books[isbn]){
    return res.status(200).json({message: "Book details", book: books[isbn]});
  } else {  
    return res.status(404).json({message: "Book not found"});
  }
 });

 function getBookByIsbn(isbn) {
  return axios.get(`http://localhost:5001/isbn/${isbn}`
  ).then(response => {
    return response.data;
  } 
  ).catch(error => {
    console.error("Error fetching book: ", error);
  });
};
  
getBookByIsbn(5)
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error(error);
  });

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const { author } = req.params;
  const booksInCatalogue = Object.values(books);
  let found = false;
  let booksByAuthor = [];   
  for (let book of booksInCatalogue) {
    if (book.author.toLocaleLowerCase() === author.toLocaleLowerCase()) {
        booksByAuthor.push(book);
        found = true; 
    }
  }
  if (found) {
      return res.status(200).json({ message: `Books found by author ${author}`, books: booksByAuthor });
  } else {
      return res.status(404).json({ message: "Author not found" });
  }
});

async function getBookByAuthor(author) {
  try {
    const response = await axios.get(`http://localhost:5001/author/${author}`);
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching books: ", error);
  }
}

getBookByAuthor("Unknown");

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const { title } = req.params;
  const booksInCatalogue = Object.values(books);
  let found = false;
  let booksByTitle = [];
  for (let book of booksInCatalogue) {
    if (book.title.toLocaleLowerCase() === title.toLocaleLowerCase()) {
        booksByTitle.push(book);
        found = true;
    }
  }
  if (found) {
      return res.status(200).json({ message: `Books found by title ${title}`, books: booksByTitle });
  } else {  
      return res.status(404).json({ message: "Title not found" });
  }

});


function getBookByTitle(title) {
  return axios.get(`http://localhost:5001/title/${title}`
  ).then(response => {
    return response.data;
  } 
  ).catch(error => {
    console.error("Error fetching book: ", error);
  });
};

getBookByTitle("Fairy tales")
  .then((data) => {
    console.log(data);
  })
  .catch((error) => {
    console.error(error);
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const { isbn } = req.params;
  
  if(books[isbn]){
    const reviews = books[isbn].reviews;
    return res.status(200).json({message: `Book with isbn ${isbn} review`, reviews: reviews});
  } else {  
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
