
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

//middleware
app.use(bodyParser.json());

// In-memory Data Storage
const adminAccounts = [];
const courses = [];
const userAccounts = [];
const purchasedCourses = [];

// Admin Routes

// Admin signup
app.post('/admin/signup', (req, res) => {
  const { username, password } = req.headers;

  // Check if the username is already taken
  const existingAdmin = adminAccounts.find((admin) => admin.username === username);
  if (existingAdmin) {
    return res.status(400).json({ message: 'Username is already taken' });
  }

  // Create a new admin account
  const newAdmin = { username, password };
  adminAccounts.push(newAdmin);

  res.json({ message: 'Admin created successfully' });
});

// Admin login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.headers;

  // Find the admin account
  const admin = adminAccounts.find((admin) => admin.username === username && admin.password === password);
  if (!admin) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  res.json({ message: 'Logged in successfully' });
});

// Create a new course
app.post('/admin/courses', (req, res) => {
  const { title, description, price, imageLink, published } = req.headers;

  // Create a new course object
  const newCourse = {
    id: courses.length + 1,
    title,
    description,
    price: parseInt(price),
    imageLink,
    published: Boolean(published),
  };

  courses.push(newCourse);

  res.json({ message: 'Course created successfully', courseId: newCourse.id });
});

// Edit an existing course
app.put('/admin/courses/:courseId', (req, res) => {
  const courseId = parseInt(req.params.courseId);
  const { title, description, price, imageLink, published } = req.headers;

  // Find the course to be edited
  const course = courses.find((course) => course.id === courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Update the course properties
  course.title = title;
  course.description = description;
  course.price = parseInt(price);
  course.imageLink = imageLink;
  course.published = Boolean(published);

  res.json({ message: 'Course updated successfully' });
});

// Get all courses
app.get('/admin/courses', (req, res) => {
  res.json({ courses });
});

// User Routes

// User signup
app.post('/users/signup', (req, res) => {
  const { username, password } = req.headers;

  // Check if the username is already taken
  const existingUser = userAccounts.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username is already taken' });
  }

  // Create a new user account
  const newUser = { username, password };
  userAccounts.push(newUser);

  res.json({ message: 'User created successfully' });
});

// User login
app.post('/users/login', (req, res) => {
  const { username, password } = req.headers;

  // Find the user account
  const user = userAccounts.find((user) => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  res.json({ message: 'Logged in successfully' });
});

// Get all courses
app.get('/users/courses', (req, res) => {
  res.json({ courses });
});

// Purchase a course
app.post('/users/courses/:courseId', (req, res) => {
  const courseId = parseInt(req.params.courseId);

  // Find the course to be purchased
  const course = courses.find((course) => course.id === courseId);
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Check if the course is already purchased
  const isCoursePurchased = purchasedCourses.find((purchasedCourse) => purchasedCourse.id === courseId);
  if (isCoursePurchased) {
    return res.status(400).json({ message: 'Course is already purchased' });
  }

  // Add the course to the purchasedCourses array
  purchasedCourses.push(course);

  res.json({ message: 'Course purchased successfully' });
});

// Get purchased courses
app.get('/users/purchasedCourses', (req, res) => {
  res.json({ purchasedCourses });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
