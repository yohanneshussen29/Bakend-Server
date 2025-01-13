const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
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
});

module.exports = mongoose.model('Store', storeSchema);
