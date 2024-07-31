const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

const mongoUrl = process.env.MONGODB_URL;

mongoose
  .connect(mongoUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB", err));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  country: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  province: { type: String },
  city: { type: String },
  postcode: { type: String },
  involvement: { type: String, required: true },
  specialties: { type: [String], required: true },
  referral: { type: String, required: true },
});

const User = mongoose.model("User", userSchema);

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

    const newUser = new User({
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
    });

    newUser
      .save()
      .then(() => res.status(200).send("Registration successful"))
      .catch((err) => {
        console.error("Error inserting data into MongoDB", err);
        res.status(500).send("Internal Server Error");
      });
  }
);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
