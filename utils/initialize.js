const Admin = require('../models/Admin');
const Student = require('../models/Student');
const bcrypt = require('bcrypt');

const initializeAdmin = async () => {
  const admin = await Admin.findOne({ username: 'DGSESMSMFBSS' });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const newAdmin = new Admin({ username: 'DGSESMSMFBSS', password: hashedPassword });
    await newAdmin.save();
    console.log('Admin account created');
  } else {
    console.log('Admin account already exists');
  }
};

const initializeUserCount = async () => {
  const lastStudent = await Student.findOne().sort({ userId: -1 }).exec();
  return lastStudent ? parseInt(lastStudent.userId.slice(2)) + 1 : 1;
};

module.exports = { initializeAdmin, initializeUserCount };
