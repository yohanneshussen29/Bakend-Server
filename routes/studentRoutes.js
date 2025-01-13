const express = require('express');
const Student = require('../models/Student');
const { initializeUserCount } = require('../utils/initialize');

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const userCount = await initializeUserCount();
    const userId = `FB${String(userCount).padStart(3, '0')}`;

    const student = new Student({ ...req.body, userId });
    await student.save();
    res.status(201).json({ message: 'Student registered successfully!', userId });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(400).json({ error: 'Failed to register student.' });
  }
});

router.get('/', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students.' });
  }
});

module.exports = router;
