const Student = require('../models/Student');

// Create a student
exports.createStudent = async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ error: 'Error creating student' });
  }
};

// Fetch all students
exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching students' });
  }
};

// Update a student
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(student);
  } catch (error) {
    res.status(400).json({ error: 'Error updating student' });
  }
};

// Delete a student
exports.deleteStudent = async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Student deleted' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting student' });
  }
};
