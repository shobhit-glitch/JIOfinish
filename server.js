const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp");
const crypto = require("crypto");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("./public/uploads"));

const MONGODB_URI = 'mongodb+srv://shobhitsinghid:xqmk8WYTvdmZfA92@cluster0.2qxpaq3.mongodb.net/jiomain';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

const notesSchema = {
  name: String,
  dateofbirth: Date,
  gender: String,
  Nationality: String,
  Address: String,
  phone: Number,
  email: String,
  school: String,
  gyear: Number,
  Percentage: Number,
  Achievements: String,
  programme: String,
  course: String,
  answer1: String,
  answer2: String,
  image: String,
  imageHash: String,
};

const Note = mongoose.model("Note", notesSchema);

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.post("/", upload.single("image"), async function (req, res) {
  try {
    if (req.file) {
      // Generate hash of the image
      const hash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

      // Check if an image with the same hash already exists
      const existingNote = await Note.findOne({ imageHash: hash });
      if (existingNote) {
        // Image is a duplicate
        return res.send("Duplicate image detected. Please go back and upload a different image.");
      }

      // Save the image to disk
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const imagePath = `public/uploads/image-${uniqueSuffix}${path.extname(req.file.originalname)}`;

      await sharp(req.file.buffer)
        .toFile(imagePath)
        .catch(err => {
          console.error("Error saving image to disk:", err);
          throw err;
        });

      // Save the form data along with the image hash and filename
      let newNote = new Note({
        name: req.body.name,
        dateofbirth: req.body.dateofbirth,
        gender: req.body.gender,
        Nationality: req.body.Nationality,
        Address: req.body.Address,
        phone: req.body.phone,
        email: req.body.email,
        school: req.body.school,
        gyear: req.body.gyear,
        Percentage: req.body.Percentage,
        Achievements: req.body.Achievements,
        programme: req.body.programme,
        course: req.body.course,
        answer1: req.body.answer1,
        answer2: req.body.answer2,
        image: `image-${uniqueSuffix}${path.extname(req.file.originalname)}`,
        imageHash: hash,
      });

      await newNote.save()
        .catch(err => {
          console.error("Error saving document to database:", err);
          throw err;
        });
    } else {
      // Save form data without image
      let newNote = new Note({
        name: req.body.name,
        dateofbirth: req.body.dateofbirth,
        gender: req.body.gender,
        Nationality: req.body.Nationality,
        Address: req.body.Address,
        phone: req.body.phone,
        email: req.body.email,
        school: req.body.school,
        gyear: req.body.gyear,
        Percentage: req.body.Percentage,
        Achievements: req.body.Achievements,
        programme: req.body.programme,
        course: req.body.course,
        answer1: req.body.answer1,
        answer2: req.body.answer2,
      });

      await newNote.save()
        .catch(err => {
          console.error("Error saving document to database:", err);
          throw err;
        });
    }
    res.redirect('/');
  } catch (error) {
    console.error("Error processing image:", error);
    res.status(500).send("Error processing image.");
  }
});

app.listen(3000, function () {
  console.log("server is running on 3000");
});
