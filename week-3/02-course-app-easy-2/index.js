
const express = require('express');
const jwt = require('jsonwebtoken');


const app = express();

// In-memory Data Storage
const adminAccounts = [];
const userAccounts = [];
const courses = [];
const purchasedCourses = [];

// Secret key for JWT
const secretKey = 'your-secret-key'; 

// Middleware to parse JSON
app.use(express.json());

// Generate JWT token
function generateToken(user) {
  const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
  return token;
}



// Admin signup
app.post('/admin/signup', (req, res) => {
  const { username, password } = req.body;

  // Check if the username is already taken
  const existingAdmin = adminAccounts.find((admin) => admin.username === username);
  if (existingAdmin) {
    return res.status(400).json({ message: 'Username is already taken' });
  }

  // Create a new admin account
  const newAdmin = { username, password };
  adminAccounts.push(newAdmin);

  // Generate JWT token
  const token = generateToken(newAdmin);

  res.json({ message: 'Admin created successfully', token });
});

// Admin login
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  // Find the admin account
  const admin = adminAccounts.find((admin) => admin.username === username && admin.password === password);
  if (!admin) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Generate JWT token
  const token = generateToken(admin);

  res.json({ message: 'Logged in successfully', token });
});

// Middleware to authenticate admin
function authenticateAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.adminUsername = decoded.username;
    next();
  });
}

// Protected admin routes
app.post('/admin/courses', authenticateAdmin, (req, res) => {
  const { title, description, price, imageLink, published } = req.body;

  // Create a new course
  const newCourse = {
    id: courses.length + 1,
    title,
    description,
    price,
    imageLink,
    published,
  };
  courses.push(newCourse);

  res.json({ message: 'Course created successfully', courseId: newCourse.id });
});

app.put('/admin/courses/:courseId', authenticateAdmin, (req, res) => {
  const { courseId } = req.params;
  const { title, description, price, imageLink, published } = req.body;

  // Find the course to be updated
  const course = courses.find((course) => course.id === parseInt(courseId));
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Update the course details
  course.title = title;
  course.description = description;
  course.price = price;
  course.imageLink = imageLink;
  course.published = published;

  res.json({ message: 'Course updated successfully' });
});

app.get('/admin/courses', authenticateAdmin, (req, res) => {
  res.json({ courses });
});

// User Routes

// User signup
app.post('/users/signup', (req, res) => {
  const { username, password } = req.body;

  // Check if the username is already taken
  const existingUser = userAccounts.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username is already taken' });
  }

  // Create a new user account
  const newUser = { username, password };
  userAccounts.push(newUser);

  // Generate JWT token
  const token = generateToken(newUser);

  res.json({ message: 'User created successfully', token });
});

// User login
app.post('/users/login', (req, res) => {
  const { username, password } = req.body;

  // Find the user account
  const user = userAccounts.find((user) => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  // Generate JWT token
  const token = generateToken(user);

  res.json({ message: 'Logged in successfully', token });
});

// Middleware to authenticate user
function authenticateUser(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.userUsername = decoded.username;
    next();
  });
}

// Protected user routes
app.get('/users/courses', authenticateUser, (req, res) => {
  res.json({ courses });
});

app.post('/users/courses/:courseId', authenticateUser, (req, res) => {
  const { courseId } = req.params;

  // Find the course to be purchased
  const course = courses.find((course) => course.id === parseInt(courseId));
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  // Purchase the course
  purchasedCourses.push(course);

  res.json({ message: 'Course purchased successfully' });
});

app.get('/users/purchasedCourses', authenticateUser, (req, res) => {
  res.json({ purchasedCourses });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
