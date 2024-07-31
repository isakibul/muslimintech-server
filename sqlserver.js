const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log("Connected to MySQL database");
});

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    mobileNumber VARCHAR(255) NOT NULL,
    province VARCHAR(255),
    city VARCHAR(255),
    postcode VARCHAR(255),
    involvement VARCHAR(255) NOT NULL,
    specialties TEXT NOT NULL,
    referral VARCHAR(255) NOT NULL
  );
`;

db.query(createTableQuery, (err, result) => {
  if (err) throw err;
  console.log("Users table created or already exists");
});

app.get("/health", (req, res) => {
  res.status(200).json({ message: "Health is okay!" });
});

app.post(
  "/api/register",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("country").notEmpty().withMessage("Country is required"),
    body("mobileNumber").notEmpty().withMessage("Mobile number is required"),
    body("involvement").notEmpty().withMessage("Involvement is required"),
    body("specialties").isArray().withMessage("Specialties should be an array"),
    body("referral").notEmpty().withMessage("Referral is required"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      email,
      firstName,
      lastName,
      country,
      mobileNumber,
      province,
      city,
      postcode,
      involvement,
      specialties,
      referral,
    } = req.body;

    const query = `
      INSERT INTO users (email, firstName, lastName, country, mobileNumber, province, city, postcode, involvement, specialties, referral)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      email,
      firstName,
      lastName,
      country,
      mobileNumber,
      province,
      city,
      postcode,
      involvement,
      JSON.stringify(specialties),
      referral,
    ];

    db.query(query, values, (err) => {
      if (err) {
        console.error("Error inserting data into MySQL", err);
        return res
          .status(500)
          .json({ message: "Internal Server Error", error: err.message });
      }
      res.status(200).send("Registration successful");
    });
  }
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
