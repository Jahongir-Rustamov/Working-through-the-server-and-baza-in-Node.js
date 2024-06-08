const mongoose = require("mongoose");
const express = require("express");
const helmet = require("helmet");
const Joi = require("joi");
const { title } = require("process");
// const cotegories = require("./cotegories"); // Bu kerak bo'lmasa
// const Router = require("./Route"); // Bu kerak bo'lmasa

const app = express();
app.use(express.json());
app.use(helmet());

const port = process.env.PORT || 5000;

// Validaya funktsiyasi
function validateL(query) {
  const Lessonquery = Joi.object({
    tags: Joi.array().items(Joi.string()),
    title: Joi.string().min(3).max(50),
    status: Joi.string(),
    trainer: Joi.string(),
    name: Joi.string().min(5).max(50),
  });
  return Lessonquery.validate(query);
}

mongoose
  .connect("mongodb://localhost/onlineLessons")
  .then(() => {
    console.log("MONGODB ga muvaffaqiyatli ulandik!!!");
  })
  .catch((err) => {
    console.log("Mongodb bilan bog'lanishda xatolik yuz berdi!", err);
  });

const SCHEMA1 = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Ism kiritilishi shart"],
    minlength: 5,
    maxlength: 50,
    trim: true,
    uppercase: true,
  },
});

const SCHEMA2 = new mongoose.Schema({
  tags: {
    type: [String],
    required: true,
    uppercase: true,
  },
  title: {
    type: String,
    required: true,
  },
  categories: {
    type: SCHEMA1,
    required: true,
  },
  trainer: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive"],
    required: true,
  },
});
const Modulall = mongoose.model("Modulall", SCHEMA2);

app.get("/api/onlineLessons", async (req, res) => {
  const values = await Modulall.find();
  res.status(200).send(values);
});

app.post("/api/onlineLessons", async (req, res) => {
  const { error } = validateL(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const new_lessons_values = new Modulall({
    title: req.body.title,
    categories: {
      name: req.body.name,
    },
    trainer: req.body.trainer,
    tags: req.body.tags,
    status: req.body.status,
  });

  try {
    const course = await new_lessons_values.save();
    res.status(201).send(course);
  } catch (err) {
    res.status(500).send("Nimadir xato ketdi.");
  }
});
app.put("/api/onlineLessons/:id", async (req, res) => {
  const { error } = validateL(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let find_v = await Modulall.findByIdAndUpdate(
    req.params.id,
    { title: req.body.title },
    {
      new: true,
    }
  );
  if (!find_v) {
    return res.status(404).send("Not found this film!");
  }
  res.send(find_v);
});
app.delete("/api/onlineLessons/:id", async (req, res) => {
  let find_v = await Modulall.findByIdAndDelete(req.params.id);
  if (!find_v) {
    return res.status(404).send("Not found this film!");
  }
  res.send(find_v);
});
app.listen(port, () => {
  console.log(`Server ${port} portda ishlayapti.`);
});
