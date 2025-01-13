const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  fatherName: String,
  grandFatherName: String,
  motherName: String,
  christianName: String,
  age: Number,
  birthDate: String,
  gender: String,
  phoneNumber: String,
  classStatus: String,
  password: String,
  userId: String,
});

module.exports = mongoose.model('Student', studentSchema);
