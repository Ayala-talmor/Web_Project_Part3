import express from 'express';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import bodyParser from 'body-parser';
import multer from 'multer';
import * as CRUD_operations from "./CRUD_functions.js";
import { sendResetEmail } from './resetEmail.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 8080;

// Multer setup for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'public/uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Middleware
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.post('/signup', CRUD_operations.createUser);
app.post('/login', CRUD_operations.loginUser);
app.post('/reset-password', CRUD_operations.resetPasswordCheckEmail);
app.post('/send-reset-mail', async (req, res) => {
  const { email } = req.body;
  try {
    await sendResetEmail(email);
    res.status(200).send({ message: "Email sent" });
  } catch (err) {
    console.error("Failed to send reset email:", err);
    res.status(500).send({ message: "Failed to send email" });
  }
});

// Upload dog with image
app.post('/add-dog', upload.single('image'), CRUD_operations.addDog);

// Other dog-related routes
app.get('/dogs', CRUD_operations.getAllDogs);
app.post('/filter-dogs', CRUD_operations.filterDogs);
app.post('/create-match', CRUD_operations.createMatch);
app.get('/matches/:userId', CRUD_operations.getMatchesByUser);
app.get('/users/:id', CRUD_operations.getUserById);
//app.post('/update-password', CRUD_operations.updatePassword);


// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}.`);
});
