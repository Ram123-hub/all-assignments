const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const app = express();
const secretKey = 'your-secret-key';

app.use(express.json());

// Helper function to read data from a file
function readDataFromFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

// Helper function to write data to a file
function writeDataToFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Admin Routes

app.post('/admin/signup', (req, res) => {
  const { username, password } = req.body;

  const adminFilePath = path.join(__dirname, 'data', 'admin.json');
  const admins = readDataFromFile(adminFilePath);

  const existingAdmin = admins.find((admin) => admin.username === username);
  if (existingAdmin) {
    return res.status(400).json({ message: 'Username is already taken' });
  }

  const newAdmin = { username, password };
  admins.push(newAdmin);
  writeDataToFile(adminFilePath, admins);

  const token = jwt.sign({ username: newAdmin.username }, secretKey, { expiresIn: '1h' });
  res.json({ message: 'Admin created successfully', token });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;

  const adminFilePath = path.join(__dirname, 'data', 'admin.json');
  const admins = readDataFromFile(adminFilePath);

  const admin = admins.find((admin) => admin.username === username && admin.password === password);
  if (!admin) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ username: admin.username }, secretKey, { expiresIn: '1h' });
  res.json({ message: 'Logged in successfully', token });
});

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

app.post('/admin/courses', authenticateAdmin, (req, res) => {
  const { title, description, price, imageLink, published } = req.body;

  const courseFilePath = path.join(__dirname, 'data', 'courses.json');
  const courses = readDataFromFile(courseFilePath);

  const newCourse = {
    id: courses.length + 1,
    title,
    description,
    price,
    imageLink,
    published,
  };
  courses.push(newCourse);
  writeDataToFile(courseFilePath, courses);

  res.json({ message: 'Course created successfully', courseId: newCourse.id });
});

app.put('/admin/courses/:courseId', authenticateAdmin, (req, res) => {
  const { courseId } = req.params;
  const { title, description, price, imageLink, published } = req.body;

  const courseFilePath = path.join(__dirname, 'data', 'courses.json');
  const courses = readDataFromFile(courseFilePath);

  const course = courses.find((course) => course.id === parseInt(courseId));
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  course.title = title || course.title;
  course.description = description || course.description;
  course.price = price || course.price;
  course.imageLink = imageLink || course.imageLink;
  course.published = published || course.published;

  writeDataToFile(courseFilePath, courses);

  res.json({ message: 'Course updated successfully' });
});

app.get('/admin/courses', authenticateAdmin, (req, res) => {
  const courseFilePath = path.join(__dirname, 'data', 'courses.json');
  const courses = readDataFromFile(courseFilePath);

  res.json({ courses });
});

// User Routes

app.post('/users/signup', (req, res) => {
  const { username, password } = req.body;

  const userFilePath = path.join(__dirname, 'data', 'users.json');
  const users = readDataFromFile(userFilePath);

  const existingUser = users.find((user) => user.username === username);
  if (existingUser) {
    return res.status(400).json({ message: 'Username is already taken' });
  }

  const newUser = { username, password };
  users.push(newUser);
  writeDataToFile(userFilePath, users);

  const token = jwt.sign({ username: newUser.username }, secretKey, { expiresIn: '1h' });
  res.json({ message: 'User created successfully', token });
});

app.post('/users/login', (req, res) => {
  const { username, password } = req.body;

  const userFilePath = path.join(__dirname, 'data', 'users.json');
  const users = readDataFromFile(userFilePath);

  const user = users.find((user) => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ username: user.username }, secretKey, { expiresIn: '1h' });
  res.json({ message: 'Logged in successfully', token });
});

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

app.get('/users/courses', authenticateUser, (req, res) => {
  const courseFilePath = path.join(__dirname, 'data', 'courses.json');
  const courses = readDataFromFile(courseFilePath);

  res.json({ courses });
});

app.post('/users/courses/:courseId', authenticateUser, (req, res) => {
  const { courseId } = req.params;

  const courseFilePath = path.join(__dirname, 'data', 'courses.json');
  const courses = readDataFromFile(courseFilePath);

  const course = courses.find((course) => course.id === parseInt(courseId));
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  const purchaseFilePath = path.join(__dirname, 'data', 'purchases.json');
  const purchases = readDataFromFile(purchaseFilePath);

  const existingPurchase = purchases.find(
    (purchase) => purchase.courseId === parseInt(courseId) && purchase.username === req.userUsername
  );
  if (existingPurchase) {
    return res.status(400).json({ message: 'Course already purchased' });
  }

  const newPurchase = { courseId: course.id, username: req.userUsername };
  purchases.push(newPurchase);
  writeDataToFile(purchaseFilePath, purchases);

  res.json({ message: 'Course purchased successfully' });
});

app.get('/users/purchasedCourses', authenticateUser, (req, res) => {
  const courseFilePath = path.join(__dirname, 'data', 'courses.json');
  const courses = readDataFromFile(courseFilePath);

  const purchaseFilePath = path.join(__dirname, 'data', 'purchases.json');
  const purchases = readDataFromFile(purchaseFilePath);

  const purchasedCourses = purchases
    .filter((purchase) => purchase.username === req.userUsername)
    .map((purchase) => {
      const course = courses.find((course) => course.id === purchase.courseId);
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        imageLink: course.imageLink,
        published: course.published,
      };
    });

  res.json({ purchasedCourses });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
