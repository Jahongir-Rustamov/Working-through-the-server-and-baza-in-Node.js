const express = require("express");
const mongoose = require("mongoose");
const helmet = require("helmet");
const Joi = require("joi");

const app = express();
app.use(helmet());
app.use(express.json());
//Validate function
function validatefunc(film) {
  const filmSchema = Joi.object({
    name: Joi.string().min(3).required(),
    Country: Joi.string(),
    Year: Joi.number().min(4).required(),
    License: Joi.boolean(),
    Species: Joi.array(),
  });
  return filmSchema.validate(film);
}
mongoose
  .connect("mongodb://localhost/NewDataBase")
  .then(() => {
    console.log("Excellent result.Go on ...");
  })
  .catch((err) => {
    console.log("Have some error in Database!");
  });

const MoviesSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    minlength: 3,
    maxlength: 100,
    trim: true,
    uppercase: true,
  },
  Country: String,
  Year: Number,
  License: Boolean,
  Species: ["Fantastic", "Dramma", " Melodramma", "Cirminal"],
});
const Model = mongoose.model("Model", MoviesSchema);
app.get("/cinema.uz/", async (req, res) => {
  const values = await Model.find().sort({ Year: 1 });
  res.send(values);
});
app.post("/cinema.uz/", async (req, res) => {
  const { error } = validatefunc(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const new_film = new Model({
    name: req.body.name,
    Country: req.body.Country,
    Year: req.body.Year,
    License: req.body.License,
    Species: req.body.Species,
  });
  const result = await new_film.save();
  res.status(201).send(result);
});

app.put("/cinema.uz/:id", async (req, res) => {
  const { error } = validatefunc(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let find_movie = await Model.findByIdAndUpdate(
    req.params.id,
    { Year: req.body.Year },
    {
      new: true,
    }
  );
  if (!find_movie) {
    return res.status(404).send("Not found this film!");
  }
  res.send(find_movie);
});

app.delete("/cinema.uz/:id", async (req, res) => {
  let find_movie = await Model.findByIdAndDelete(req.params.id);
  if (!find_movie) {  
    return res.status(404).send("Not found this film!");
  }
  res.send(find_movie);
});
app.listen(3000, () => {
  console.log("Server running on 3000 port:...");
});
