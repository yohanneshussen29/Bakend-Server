const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const path = require('path');

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection (Replace with your actual connection string)
mongoose.connect(
  'mongodb+srv://yohannes:yohannes@cluster0.algru.mongodb.net/schoolDB?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 90000,
  }
)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('Error connecting to MongoDB:', err));

// Admin schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'admin' },
});

const Admin = mongoose.model('Admin', adminSchema);

// Initialize admin account
async function initializeAdmin() {
  const admin = await Admin.findOne({ username: 'DGSESMSMFBSS' });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
    const newAdmin = new Admin({ username: 'DGSESMSMFBSS', password: hashedPassword });
    await newAdmin.save();
    console.log('Admin account created');
  } else {
    console.log('Admin account already exists');
  }
}



// Define the Student schema
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
  userId: String, // Store the userId
});

const Student = mongoose.model('Student', studentSchema);

// Initialize user count dynamically from the database
let userCount = 1;

const initializeUserCount = async () => {
  const lastStudent = await Student.findOne().sort({ userId: -1 }).exec();
  if (lastStudent) {
    userCount = parseInt(lastStudent.userId.slice(2)) + 1;
  }
};

// POST route for creating a new student
app.post('/users', async (req, res) => {
  try {
    // Ensure userCount is initialized before registration
    await initializeUserCount();

    const userId = `FB${String(userCount).padStart(3, '0')}`;
    userCount++;

    const studentData = {
      name: req.body.name,
      fatherName: req.body.fatherName,
      grandFatherName: req.body.grandFatherName,
      motherName: req.body.motherName,
      christianName: req.body.christianName,
      age: req.body.age,
      birthDate: req.body.birthDate,
      gender: req.body.gender,
      phoneNumber: req.body.phoneNumber,
      classStatus: req.body.classStatus,
      password: req.body.password,
      userId: userId,
    };

    const student = new Student(studentData);
    await student.save();

    res.status(201).send({ message: 'Student registered successfully!', userId: userId });
  } catch (error) {
    console.error('Error registering student:', error);
    res.status(400).send({ error: 'Failed to register student.' });
  }
});

// GET route to fetch all students
app.get('/users', async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).send(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send({ error: 'Failed to fetch students.' });
  }
});

app.get('/store', async (req, res) => {
  try {
    const students = await Store.find(); // Replace `Store` with the correct model for "store" collection
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).send({ error: 'Failed to fetch students.' });
  }
});


// DELETE route to remove a student by _id
app.delete('/users/:id', async (req, res) => {
  try {
    const result = await Student.findByIdAndDelete(req.params.id);
    if (result) {
      res.status(200).send({ message: 'Student deleted successfully!' });
    } else {
      res.status(404).send({ error: 'Student not found.' });
    }
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(400).send({ error: 'Failed to delete student.' });
  }
});

// GET route to fetch a student by _id
app.get('/users/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (student) {
      res.status(200).json(student);
    } else {
      res.status(404).send({ error: 'Student not found.' });
    }
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).send({ error: 'Failed to fetch student.' });
  }
});

// PUT route to update a student's data
app.put('/users/:id', async (req, res) => {
  try {
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (updatedStudent) {
      res.status(200).send({ message: 'Student updated successfully!', student: updatedStudent });
    } else {
      res.status(404).send({ error: 'Student not found.' });
    }
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).send({ error: 'Failed to update student.' });
  }
});


// Add this route to handle login requests
app.post('/users/login', async (req, res) => {
  try {
    const { userId, password } = req.body;

    const user = await Student.findOne({ userId, password });

    if (user) {
      res.status(200).json(user); // Return user data
    } else {
      res.status(404).send({ error: 'Invalid User ID or Phone Number' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send({ error: 'An error occurred during login.' });
  }
});


// Start the server
const port = 5000;
app.listen(port, () => {
  initializeUserCount(); // Ensure user count is initialized when the server starts
  initializeAdmin()
  console.log(`Server running on port ${port}`);
});



// const storeSchema = new mongoose.Schema({
//   name: String,
//   fatherName: String,
//   grandFatherName: String,
//   motherName: String,
//   christianName: String,
//   age: Number,
//   birthDate: String,
//   gender: String,
//   phoneNumber: String,
//   classStatus: String,
//   password: String,
// });

// const Store = mongoose.model('Store', storeSchema);

// // User schema for login
// const userSchema = new mongoose.Schema({
//   userId: String,
//   password: String,
// });

// const User = mongoose.model('User', userSchema);

// // POST endpoint to save students to 'store'
// app.post('/store', async (req, res) => {
//   try {
//     const student = new Store(req.body);
//     await student.save();
//     res.status(201).send({ message: 'Student registered successfully!' });
//   } catch (error) {
//     console.error('Error saving to store:', error);
//     res.status(400).send({ error: 'Failed to save student.' });
//   }
// });

// // Login endpoint for 'users' collection
// app.post('/users/login', async (req, res) => {
//   try {
//     const { userId, password } = req.body;

//     const user = await User.findOne({ userId, password });
//     if (user) {
//       res.status(200).send({ message: 'Login successful!', user });
//     } else {
//       res.status(404).send({ error: 'Invalid User ID or Phone Number.' });
//     }
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).send({ error: 'An error occurred during login.' });
//   }
// });

// app.post('/store', async (req, res) => {
//   try {
//     const studentData = {
//       name: req.body.name,
//       fatherName: req.body.fatherName,
//       grandFatherName: req.body.grandFatherName,
//       motherName: req.body.motherName,
//       christianName: req.body.christianName,
//       age: req.body.age,
//       birthDate: req.body.birthDate,
//       gender: req.body.gender,
//       phoneNumber: req.body.phoneNumber,
//       classStatus: req.body.classStatus,
//       password: req.body.password,
//     };

//     const student = new Store(studentData); // Assuming Store is your database model
//     const savedStudent = await student.save();

//     // Include saved student data in the response
//     res.status(201).send({
//       message: 'Student registered successfully!',
//       userId: savedStudent._id, // Return the generated ID
//       name: savedStudent.name,
//       fatherName: savedStudent.fatherName,
//       grandFatherName: savedStudent.grandFatherName,
//     });
//   } catch (error) {
//     console.error('Error registering student:', error);
//     res.status(400).send({ error: 'Failed to register student.' });
//   }
// });


// // GET route to fetch a student by _id in the "store" collection
// app.get('/store/:id', async (req, res) => {
//   try {
//     const student = await Store.findById(req.params.id);
//     if (student) {
//       res.status(200).json(student);
//     } else {
//       res.status(404).send({ error: 'Student not found.' });
//     }
//   } catch (error) {
//     console.error('Error fetching student:', error);
//     res.status(500).send({ error: 'Failed to fetch student.' });
//   }
// });


// // DELETE route to remove a student by _id from the store collection
// app.delete('/store/:id', async (req, res) => {
//   try {
//     const result = await Store.findByIdAndDelete(req.params.id);
//     if (result) {
//       res.status(200).send({ message: 'Student deleted successfully!' });
//     } else {
//       res.status(404).send({ error: 'Student not found.' });
//     }
//   } catch (error) {
//     console.error('Error deleting student:', error);
//     res.status(400).send({ error: 'Failed to delete student.' });
//   }
// });


// // PUT route to update a student in the "store" collection and save to "users" collection
// app.put('/store/:id', async (req, res) => {
//   try {
//     // Update the student in the store collection
//     const updatedStudent = await Store.findByIdAndUpdate(req.params.id, req.body, { new: true });

//     if (updatedStudent) {
//       // Save the updated student to the users collection
//       const userData = new User({
//         name: updatedStudent.name,
//         fatherName: updatedStudent.fatherName,
//         grandFatherName: updatedStudent.grandFatherName,
//         motherName: updatedStudent.motherName,
//         christianName: updatedStudent.christianName,
//         age: updatedStudent.age,
//         birthDate: updatedStudent.birthDate,
//         gender: updatedStudent.gender,
//         phoneNumber: updatedStudent.phoneNumber,
//         classStatus: updatedStudent.classStatus,
//         password: updatedStudent.password,
//         userId: updatedStudent.userId,  // Assuming you want to maintain the same userId
//       });

//       await userData.save();

//       // Respond with updated student data from the store collection
//       res.status(200).json(updatedStudent);
//     } else {
//       res.status(404).send({ error: 'Student not found in store collection.' });
//     }
//   } catch (error) {
//     console.error('Error updating student:', error);
//     res.status(500).send({ error: 'Failed to update student.' });
//   }
// });


// // PUT route to update a student's data in the /users collection
// app.put('/users/:id', async (req, res) => {
//   try {
//     const updatedStudent = await Student.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );

//     if (updatedStudent) {
//       res.status(200).send({ message: 'Student updated successfully!', student: updatedStudent });
//     } else {
//       res.status(404).send({ error: 'Student not found.' });
//     }
//   } catch (error) {
//     console.error('Error updating student:', error);
//     res.status(500).send({ error: 'Failed to update student.' });
//   }
// });


// app.post('/login', async (req, res) => {
//   const { name, password } = req.body;
//   try {
//     // Find user by name and password
//     const user = await User.findOne({ name, password });

//     if (!user) {
//       return res.status(400).send('User not found or incorrect details');
//     }

//     // Generate a JWT token
//     const token = jwt.sign({ userId: user._id }, 'your-secret-key', { expiresIn: '1h' });

//     res.json({ token });
//   } catch (error) {
//     res.status(500).send('Server error');
//   }
// });

// // GET route to fetch all users
// app.get('/values', (req, res) => {
//   try {
//     res.json(users);
//   } catch (err) {
//     console.error('Error fetching users:', err);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });

// // POST route to add a new user
// app.post('/values', (req, res) => {
//   const { userId, name, classStatus } = req.body;

//   if (!userId || !name || !classStatus) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   const newUser = { userId, name, classStatus };
//   users.push(newUser); // Add to in-memory list (replace with DB logic)

//   res.status(201).json(newUser); // Send back the created user
// });

// // DELETE route to delete a user
// app.delete('/values/:id', (req, res) => {
//   const { id } = req.params;
//   users = users.filter(user => user.userId !== id);
//   res.status(200).json({ message: 'User deleted successfully' });
// });

// // PUT route to edit a user
// app.put('/values/:id', (req, res) => {
//   const { id } = req.params;
//   const { name, classStatus } = req.body;

//   const user = users.find(u => u.userId === id);
//   if (!user) {
//     return res.status(404).json({ error: 'User not found' });
//   }

//   user.name = name || user.name;
//   user.classStatus = classStatus || user.classStatus;

//   res.status(200).json(user); // Send back the updated user
// });







// #################################### Save the users in /save db #############################################
// Define the Mongoose schema and model
// const studentSchema8 = new mongoose.Schema({
//   userId: String,
//   name: String,
//   password: String,
//   classStatus: String,
//   seasonOne: Number,
//   seasonTwo: Number,
//   seasonThree: Number,
//   seasonFour: Number,
//   seasonFive: Number,
//   seasonSix: Number,
// });

// const Student8 = mongoose.model('theValue', studentSchema8); // Collection name will be `values`

// // Initialize user count
// let userCount6 = 1;
// const initializeUserCount6 = async () => {
//   try {
//     const lastStudent = await Student8.findOne().sort({ userId: -1 }).exec();
//     if (lastStudent) {
//       userCount6 = parseInt(lastStudent.userId.slice(2)) + 1; // Extract numeric part of userId
//     }
//   } catch (error) {
//     console.error('Error initializing user count:', error);
//   }
// };
// initializeUserCount6();

// // POST route to create a new student
// app.post('/save', async (req, res) => {
//   const userId = `FB${String(userCount6).padStart(3, '0')}`; // Generate unique userId
//   userCount6++; // Increment the user ID counter

//   try {
//     const newStudent = new Student8({
//       userId,
//       ...req.body,
//     });
//     await newStudent.save();
//     res.status(201).json(newStudent);
//   } catch (error) {
//     console.error('Error creating student:', error);
//     res.status(400).json({ error: 'Error creating student.' });
//   }
// });

// // GET route to fetch all students
// app.get('/save', async (req, res) => {
//   try {
//     const students = await Student8.find();
//     res.status(200).json(students);
//   } catch (error) {
//     console.error('Error fetching students:', error);
//     res.status(400).json({ error: 'Error fetching students.' });
//   }
// });

// // GET route to fetch a student by userId
// app.get('/save/:userId', async (req, res) => {
//   try {
//     const student = await Student8.findOne({ userId: req.params.userId });
//     if (!student) {
//       return res.status(404).json({ error: 'Student not found.' });
//     }
//     res.status(200).json(student);
//   } catch (error) {
//     console.error('Error fetching student:', error);
//     res.status(400).json({ error: 'Error fetching student.' });
//   }
// });

// // PUT route to update a student by userId
// app.put('/save/:userId', async (req, res) => {
//   try {
//     const updatedStudent = await Student8.findOneAndUpdate(
//       { userId: req.params.userId },
//       req.body,
//       { new: true, runValidators: true }
//     );
//     if (!updatedStudent) {
//       return res.status(404).json({ error: 'Student not found.' });
//     }
//     res.status(200).json(updatedStudent);
//   } catch (error) {
//     console.error('Error updating student:', error);
//     res.status(400).json({ error: 'Error updating student.' });
//   }
// });

// // DELETE route to remove a student by userId
// app.delete('/save/:userId', async (req, res) => {
//   try {
//     const deletedStudent = await Student8.findOneAndDelete({ userId: req.params.userId });
//     if (!deletedStudent) {
//       return res.status(404).json({ error: 'Student not found.' });
//     }
//     res.status(200).json({ message: 'Student deleted successfully!' });
//   } catch (error) {
//     console.error('Error deleting student:', error);
//     res.status(400).json({ error: 'Error deleting student.' });
//   }
// });

// // DELETE route to clear all students and reset userId
// app.delete('/save', async (req, res) => {
//   try {
//     await Student8.deleteMany({}); // Clear all documents
//     userCount6 = 1; // Reset user count
//     res.status(200).json({ message: 'All students deleted and userId reset successfully!' });
//   } catch (error) {
//     console.error('Error clearing students:', error);
//     res.status(400).json({ error: 'Error clearing students.' });
//   }
// });








// // app.get('/adminLogin', (req, res) => {
// //   res.sendFile(path.join(__dirname, '../Admin/Choose one/index.html')); // Replace 'index.html' with your HTML file name
// // });

// // Admin login endpoint
// app.post('/adminLogin', async (req, res) => {
//   try {
//     const { userId, password } = req.body;
//     const user = await Admin.findOne({ username: userId });
//     if (user && (await bcrypt.compare(password, user.password))) {
//       res.status(200).json({ success: true, message: 'Login successful', username: user.username });
//     } else {
//       res.status(401).json({ success: false, error: 'Invalid credentials' });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// });

// // Change password endpoint
// app.post('/changePassword', async (req, res) => {
//   try {
//     const { username, password } = req.body;
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const updated = await Admin.updateOne({ username }, { password: hashedPassword });
//     if (updated.modifiedCount > 0) {
//       res.status(200).json({ success: true, message: 'Password updated successfully' });
//     } else {
//       res.status(404).json({ success: false, error: 'User not found' });
//     }
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, error: 'Internal server error' });
//   }
// });

