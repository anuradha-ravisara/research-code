// // backend/index.js
// require('dotenv').config(); // Load environment variables from .env file
// const express = require('express');
// const multer = require('multer');
// const { RekognitionClient, DetectTextCommand } = require('@aws-sdk/client-rekognition');
// const mongoose = require('mongoose'); // Import Mongoose for MongoDB
// const axios = require('axios'); // Import axios for HTTP requests
// const fs = require('fs');
// const sharp = require('sharp'); // Import sharp for image preprocessing
 
// const app = express();
// const port = 5000;
 
// // MongoDB connection
// mongoose.connect(
//   "mongodb+srv://admin:7IejOoiRe6wmbr57@mmcaredb.rrvnwxo.mongodb.net/Node-API?retryWrites=true&w=majority&appName=MmCareDB",
//   {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   }
// )
//   .then(() => {
//     console.log("Connected to MongoDB database!");
//   })
//   .catch((error) => {
//     console.error("Connection to MongoDB failed!", error);
//   });
 
// // Define a detailed schema for storing extracted data
// const reportSchema = new mongoose.Schema({
//   // Personal Information
//   fullName: String,
//   age: Number,
//   dateOfVisit: Date,
 
//   // Medical Information
//   gestationalAgeWeeks: Number,
//   gravidaParity: String,
//   bloodPressure: String,
//   weightKg: Number,
//   heightCm: Number,
//   bmi: Number,
 
//   // Medical History
//   previousMedicalConditions: String,
//   currentMedications: String,
//   allergies: String,
 
//   // Obstetric Examination
//   fundalHeightCm: Number,
//   fetalHeartRateBpm: Number,
//   positionOfBaby: String,
//   movementsOfBaby: String,
 
//   // Lab Results
//   hemoglobinLevelGdL: Number,
//   bloodSugarLevelMgDl: Number,
 
//   // Next Appointment
//   nextAppointmentDate: Date,
 
//   // Doctor's Information
//   doctorSignature: String,
 
//   createdAt: { type: Date, default: Date.now }
// });
 
// const Report = mongoose.model('Report', reportSchema); // Create a Mongoose model
 
// // Configure AWS Rekognition Client
// const client = new RekognitionClient({
//   region: process.env.AWS_REGION, // AWS region from environment variables
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID, // AWS Access Key ID from environment variables
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // AWS Secret Access Key from environment variables
//   },
// });
 
// // Set up Multer for image uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });
 
// const upload = multer({ storage });
 
// // Helper function to preprocess image
// async function preprocessImage(imagePath) {
//   const processedImagePath = 'uploads/processed_image.png';
 
//   await sharp(imagePath)
//     .grayscale() // Convert to grayscale
//     .normalize() // Normalize the image
//     .toFile(processedImagePath); // Save processed image
 
//   return processedImagePath;
// }
 
// // Helper function to extract fields from text
// function extractField(text, label) {
//   const regex = new RegExp(`${label}\\s*:\\s*(.*)`, 'i');
//   const match = text.match(regex);
//   return match ? match[1].trim() : '';
// }
 
// // Route to handle image uploads and analysis
// app.post('/analyze-image', upload.single('image'), async (req, res) => {
//   const imagePath = req.file.path;
 
//   // Preprocess the image
//   const processedImagePath = await preprocessImage(imagePath);
//   // Read the processed image as bytes
//   const imageBytes = fs.readFileSync(processedImagePath);
 
//   const params = {
//     Image: { Bytes: imageBytes },
//   };
 
//   const command = new DetectTextCommand(params);
 
//   try {
//     const data = await client.send(command);
//     const extractedText = data.TextDetections.map((detection) => detection.DetectedText).join(', ');
//     console.log('Extracted Text:', extractedText);
 
//     // Extract each field from the extracted text
//     const fullName = extractField(extractedText, 'Full Name');
//     const age = parseInt(extractField(extractedText, 'Age'), 10);
//     const dateOfVisit = new Date(extractField(extractedText, 'Date of Visit'));
//     const gestationalAgeWeeks = parseInt(extractField(extractedText, 'Gestational Age \\(weeks\\)'), 10);
//     const gravidaParity = extractField(extractedText, 'Gravida/Parity');
//     const bloodPressure = extractField(extractedText, 'Blood Pressure');
//     const weightKg = parseFloat(extractField(extractedText, 'Weight'));
//     const heightCm = parseFloat(extractField(extractedText, 'Height'));
//     const bmi = parseFloat(extractField(extractedText, 'Body Mass Index \\(BMI\\)'));
//     const previousMedicalConditions = extractField(extractedText, 'Previous Medical Conditions');
//     const currentMedications = extractField(extractedText, 'Current Medications');
//     const allergies = extractField(extractedText, 'Allergies');
//     const fundalHeightCm = parseFloat(extractField(extractedText, 'Fundal Height'));
//     const fetalHeartRateBpm = parseInt(extractField(extractedText, 'Fetal Heart Rate'), 10);
//     const positionOfBaby = extractField(extractedText, 'Position of the Baby');
//     const movementsOfBaby = extractField(extractedText, 'Movements of the Baby');
//     const hemoglobinLevelGdL = parseFloat(extractField(extractedText, 'Hemoglobin Level'));
//     const bloodSugarLevelMgDl = parseFloat(extractField(extractedText, 'Blood Sugar Level'));
//     const nextAppointmentDate = new Date(extractField(extractedText, 'Next Appointment Date'));
//     const doctorSignature = extractField(extractedText, "Doctor's Signature");
 
//     // Send extracted text to the Python API for prediction
//     const response = await axios.post('http://127.0.0.1:5001/predict', {
//       features: extractedText
//     });
 
//     const predictedConcerns = response.data.prediction;
 
//     // Save extracted data and predictions to MongoDB
//     const newReport = new Report({
//       fullName,
//       age,
//       dateOfVisit,
//       gestationalAgeWeeks,
//       gravidaParity,
//       bloodPressure,
//       weightKg,
//       heightCm,
//       bmi,
//       previousMedicalConditions,
//       currentMedications,
//       allergies,
//       fundalHeightCm,
//       fetalHeartRateBpm,
//       positionOfBaby,
//       movementsOfBaby,
//       hemoglobinLevelGdL,
//       bloodSugarLevelMgDl,
//       nextAppointmentDate,
//       doctorSignature,
//       predictedConcerns
//     });
 
//     await newReport.save();
 
//     res.json({ extractedText, predictedConcerns });
//   } catch (err) {
//     console.error('Error processing the image:', err);
//     res.status(500).send('Error processing the image');
//   }
// });
 
// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });



// require('dotenv').config();
// const express = require('express');
// const multer = require('multer');
// const { RekognitionClient, DetectTextCommand } = require('@aws-sdk/client-rekognition');
// const mongoose = require('mongoose');
// const fs = require('fs');
// const { exec } = require('child_process');

// const app = express();
// const port = 5000;

// // MongoDB connection
// mongoose.connect(
//   "mongodb+srv://admin:7IejOoiRe6wmbr57@mmcaredb.rrvnwxo.mongodb.net/Node-API?retryWrites=true&w=majority&appName=MmCareDB"
// )
//   .then(() => console.log("Connected to MongoDB database!"))
//   .catch((error) => console.error("Connection to MongoDB failed!", error));

// // Define a schema for storing extracted data
// const healthRecordSchema = new mongoose.Schema({
//   fullName: String,
//   age: Number,
//   dateOfVisit: Date,
//   gestationalAge: Number,
//   gravidaParity: String,
//   bloodPressure: String,
//   weight: Number,
//   height: Number,
//   bmi: Number,
//   previousConditions: String,
//   currentMedications: String,
//   allergies: String,
//   fundalHeight: Number,
//   fetalHeartRate: Number,
//   positionOfBaby: String,
//   movementsOfBaby: String,
//   hemoglobinLevel: Number,
//   bloodSugarLevel: Number,
//   nextAppointmentDate: Date,
//   createdAt: { type: Date, default: Date.now }
// });

// const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema); // Create a Mongoose model

// // Configure AWS Rekognition Client
// const client = new RekognitionClient({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// // Set up Multer for image uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Directory for storing uploads
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname); // Save with original filename
//   },
// });

// const upload = multer({ storage });

// // Enhanced helper function to extract fields from text
// function extractField(text, label, type = 'string', additionalPattern = '') {
//   const regex = new RegExp(`${label}\\s*[:\\{]?\\s*([A-Za-z0-9/\\-. ]+${additionalPattern})`, 'i');
//   const match = text.match(regex);

//   if (!match) return type === 'number' ? NaN : (type === 'date' ? null : '');

//   let value = match[1].trim();

//   // Convert to the appropriate type
//   if (type === 'number') {
//     // Remove non-numeric characters (except decimal point and minus sign) and parse as float
//     value = value.replace(/[^0-9.-]/g, '');
//     const numValue = parseFloat(value);
//     return isNaN(numValue) ? NaN : numValue;
//   }

//   if (type === 'date') {
//     // Convert to Date object and check validity
//     const dateValue = new Date(value);
//     return isNaN(dateValue.getTime()) ? null : dateValue;
//   }

//   return value; // For strings
// }

// // Route to handle image uploads and analysis
// app.post('/analyze-image', upload.single('image'), async (req, res) => {
//   const imagePath = req.file.path;

//   // Read the original image as bytes
//   const imageBytes = fs.readFileSync(imagePath);
//   const params = {
//     Image: { Bytes: imageBytes },
//   };

//   const command = new DetectTextCommand(params);

//   try {
//     // Call AWS Rekognition to detect text
//     const data = await client.send(command);
//     const extractedText = data.TextDetections.map((detection) => detection.DetectedText).join(', ');
//     console.log('Extracted Text:', extractedText);

//     // Extract each field from the extracted text
//     const fullName = extractField(extractedText, 'Full Name');
//     const age = extractField(extractedText, 'Age', 'number');
//     const dateOfVisit = extractField(extractedText, 'Date of Visit', 'date');
//     const gestationalAge = extractField(extractedText, 'Gestational Age \\(weeks\\)', 'number');
//     const gravidaParity = extractField(extractedText, 'Gravida/Parity');
//     const bloodPressure = extractField(extractedText, 'Blood Pressure', 'string', 'mm Hg|mmHg|mm lig');
//     const weight = extractField(extractedText, 'Weight', 'number');
//     const height = extractField(extractedText, 'Height', 'number');
//     const bmi = extractField(extractedText, 'Body Mass Index \\(BMI\\)', 'number');
//     const previousConditions = extractField(extractedText, 'Previous Medical Conditions');
//     const currentMedications = extractField(extractedText, 'Current Medications');
//     const allergies = extractField(extractedText, 'Allergies');
//     const fundalHeight = extractField(extractedText, 'Fundal Height', 'number');
//     const fetalHeartRate = extractField(extractedText, 'Fetal Heart Rate', 'number');
//     const positionOfBaby = extractField(extractedText, 'Position of the Baby');
//     const movementsOfBaby = extractField(extractedText, 'Movements of the Baby');
//     const hemoglobinLevel = extractField(extractedText, 'Hemoglobin Level', 'number');
//     const bloodSugarLevel = extractField(extractedText, 'Blood Sugar Leve', 'number'); // Corrected label
//     const nextAppointmentDate = extractField(extractedText, 'Next Appointment Date', 'date'); // Ensure this is defined

//     // Validate and handle NaN values
//     const fieldsToValidate = { gestationalAge, bmi, fundalHeight, hemoglobinLevel, bloodSugarLevel };
//     for (let key in fieldsToValidate) {
//       if (isNaN(fieldsToValidate[key])) {
//         fieldsToValidate[key] = null; // Set NaN fields to null
//       }
//     }

//     // Create a new HealthRecord object
//     const newHealthRecord = new HealthRecord({
//       fullName,
//       age,
//       dateOfVisit,
//       gestationalAge: fieldsToValidate.gestationalAge,
//       gravidaParity,
//       bloodPressure,
//       weight,
//       height,
//       bmi: fieldsToValidate.bmi,
//       previousConditions,
//       currentMedications,
//       allergies,
//       fundalHeight: fieldsToValidate.fundalHeight,
//       fetalHeartRate,
//       positionOfBaby,
//       movementsOfBaby,
//       hemoglobinLevel: fieldsToValidate.hemoglobinLevel,
//       bloodSugarLevel: fieldsToValidate.bloodSugarLevel,
//       nextAppointmentDate
//     });

//     // Save extracted data to MongoDB
//     await newHealthRecord.save();

//     console.log('Data saved successfully to the healthrecords collection');
//     res.json({ message: 'Data saved successfully to the healthrecords collection', extractedText });
//   } catch (err) {
//     console.error('Error processing the image:', err);
//     res.status(500).send('Error processing the image');
//   }
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

// require('dotenv').config(); // Load environment variables from .env file
// const express = require('express');
// const multer = require('multer');
// const { RekognitionClient, DetectTextCommand } = require('@aws-sdk/client-rekognition');
// const mongoose = require('mongoose');
// const fs = require('fs');
// const { exec } = require('child_process');
// const { PythonShell } = require('python-shell'); // Import PythonShell

// const app = express();
// const port = 5000;

// // Middleware to parse JSON requests
// app.use(express.json());

// // MongoDB connection
// mongoose.connect(
//   "mongodb+srv://admin:7IejOoiRe6wmbr57@mmcaredb.rrvnwxo.mongodb.net/Node-API?retryWrites=true&w=majority&appName=MmCareDB"
// )
//   .then(() => console.log("Connected to MongoDB database!"))
//   .catch((error) => console.error("Connection to MongoDB failed!", error));

// // Define a schema for storing extracted data
// const healthRecordSchema = new mongoose.Schema({
//   fullName: String,
//   age: Number,
//   dateOfVisit: Date,
//   gestationalAge: Number,
//   gravidaParity: String,
//   bloodPressure: String,
//   weight: Number,
//   height: Number,
//   bmi: Number,
//   previousConditions: String,
//   currentMedications: String,
//   allergies: String,
//   fundalHeight: Number,
//   fetalHeartRate: Number,
//   positionOfBaby: String,
//   movementsOfBaby: String,
//   hemoglobinLevel: Number,
//   bloodSugarLevel: Number,
//   nextAppointmentDate: Date,
//   createdAt: { type: Date, default: Date.now }
// });

// const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema); // Create a Mongoose model

// // Configure AWS Rekognition Client
// const client = new RekognitionClient({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// // Set up Multer for image uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Directory for storing uploads
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname); // Save with original filename
//   },
// });

// const upload = multer({ storage });

// // Enhanced helper function to extract fields from text
// function extractField(text, label, type = 'string', additionalPattern = '') {
//   const regex = new RegExp(`${label}\\s*[:\\{]?\\s*([A-Za-z0-9/\\-. ]+${additionalPattern})`, 'i');
//   const match = text.match(regex);

//   if (!match) return type === 'number' ? NaN : (type === 'date' ? null : '');

//   let value = match[1].trim();

//   // Convert to the appropriate type
//   if (type === 'number') {
//     value = value.replace(/[^0-9.-]/g, '');
//     const numValue = parseFloat(value);
//     return isNaN(numValue) ? NaN : numValue;
//   }

//   if (type === 'date') {
//     const dateValue = new Date(value);
//     return isNaN(dateValue.getTime()) ? null : dateValue;
//   }

//   return value; // For strings
// }

// // Route to handle image uploads and analysis
// app.post('/analyze-image', upload.single('image'), async (req, res) => {
//   const imagePath = req.file.path;

//   // Read the original image as bytes
//   const imageBytes = fs.readFileSync(imagePath);
//   const params = {
//     Image: { Bytes: imageBytes },
//   };

//   const command = new DetectTextCommand(params);

//   try {
//     // Call AWS Rekognition to detect text
//     const data = await client.send(command);
//     const extractedText = data.TextDetections.map((detection) => detection.DetectedText).join(', ');
//     console.log('Extracted Text:', extractedText);

//     // Extract each field from the extracted text
//     const fullName = extractField(extractedText, 'Full Name');
//     const age = extractField(extractedText, 'Age', 'number');
//     const dateOfVisit = extractField(extractedText, 'Date of Visit', 'date');
//     const gestationalAge = extractField(extractedText, 'Gestational Age \\(weeks\\)', 'number');
//     const gravidaParity = extractField(extractedText, 'Gravida/Parity');
//     const bloodPressure = extractField(extractedText, 'Blood Pressure', 'string', 'mm Hg|mmHg|mm lig');
//     const weight = extractField(extractedText, 'Weight', 'number');
//     const height = extractField(extractedText, 'Height', 'number');
//     const bmi = extractField(extractedText, 'Body Mass Index \\(BMI\\)', 'number');
//     const previousConditions = extractField(extractedText, 'Previous Medical Conditions');
//     const currentMedications = extractField(extractedText, 'Current Medications');
//     const allergies = extractField(extractedText, 'Allergies');
//     const fundalHeight = extractField(extractedText, 'Fundal Height', 'number');
//     const fetalHeartRate = extractField(extractedText, 'Fetal Heart Rate', 'number');
//     const positionOfBaby = extractField(extractedText, 'Position of the Baby');
//     const movementsOfBaby = extractField(extractedText, 'Movements of the Baby');
//     const hemoglobinLevel = extractField(extractedText, 'Hemoglobin Level', 'number');
//     const bloodSugarLevel = extractField(extractedText, 'Blood Sugar Leve', 'number'); // Corrected label
//     const nextAppointmentDate = extractField(extractedText, 'Next Appointment Date', 'date');

//     // Validate and handle NaN values
//     const fieldsToValidate = { gestationalAge, bmi, fundalHeight, hemoglobinLevel, bloodSugarLevel };
//     for (let key in fieldsToValidate) {
//       if (isNaN(fieldsToValidate[key])) {
//         fieldsToValidate[key] = null; // Set NaN fields to null
//       }
//     }

//     // Create a new HealthRecord object
//     const newHealthRecord = new HealthRecord({
//       fullName,
//       age,
//       dateOfVisit,
//       gestationalAge: fieldsToValidate.gestationalAge,
//       gravidaParity,
//       bloodPressure,
//       weight,
//       height,
//       bmi: fieldsToValidate.bmi,
//       previousConditions,
//       currentMedications,
//       allergies,
//       fundalHeight: fieldsToValidate.fundalHeight,
//       fetalHeartRate,
//       positionOfBaby,
//       movementsOfBaby,
//       hemoglobinLevel: fieldsToValidate.hemoglobinLevel,
//       bloodSugarLevel: fieldsToValidate.bloodSugarLevel,
//       nextAppointmentDate
//     });

//     // Save extracted data to MongoDB
//     await newHealthRecord.save();

//     console.log('Data saved successfully to the healthrecords collection');
//     res.json({ message: 'Data saved successfully to the healthrecords collection', extractedText });
//   } catch (err) {
//     console.error('Error processing the image:', err);
//     res.status(500).send('Error processing the image');
//   }
// });

// // Add a new route for predicting health risk
// app.post('/predict-health-risk', (req, res) => {
//   const { bloodPressureSystolic, bloodPressureDiastolic, bmi, bloodSugarLevel } = req.body;

//   // Options to send to the Python script
//   const options = {
//     mode: 'text',
//     pythonOptions: ['-u'],
//     args: [bloodPressureSystolic, bloodPressureDiastolic, bmi, bloodSugarLevel]
//   };

//   // Run the Python script for prediction
//   PythonShell.run('predict.py', options, function (err, results) {
//     if (err) {
//       console.error('Error running the Python script:', err);
//       return res.status(500).send('Error predicting health risk');
//     }

//     const prediction = results[0];
//     res.json({ message: 'Prediction successful', risk: prediction });
//   });
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });


// require('dotenv').config(); // Load environment variables from .env file
// const express = require('express');
// const multer = require('multer');
// const { RekognitionClient, DetectTextCommand } = require('@aws-sdk/client-rekognition');
// const mongoose = require('mongoose');
// const fs = require('fs');
// const { PythonShell } = require('python-shell'); // Import PythonShell

// const app = express();
// const port = 5000;

// // Middleware to parse JSON requests
// app.use(express.json());

// // MongoDB connection
// mongoose.connect(
//   "mongodb+srv://admin:7IejOoiRe6wmbr57@mmcaredb.rrvnwxo.mongodb.net/Node-API?retryWrites=true&w=majority&appName=MmCareDB"
// )
//   .then(() => console.log("Connected to MongoDB database!"))
//   .catch((error) => console.error("Connection to MongoDB failed!", error));

// // Define a schema for storing extracted data
// const healthRecordSchema = new mongoose.Schema({
//   fullName: String,
//   age: Number,
//   dateOfVisit: Date,
//   gestationalAge: Number,
//   gravidaParity: String,
//   bloodPressure: String,
//   weight: Number,
//   height: Number,
//   bmi: Number,
//   previousConditions: String,
//   currentMedications: String,
//   allergies: String,
//   fundalHeight: Number,
//   fetalHeartRate: Number,
//   positionOfBaby: String,
//   movementsOfBaby: String,
//   hemoglobinLevel: Number,
//   bloodSugarLevel: Number,
//   nextAppointmentDate: Date,
//   createdAt: { type: Date, default: Date.now }
// });

// const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema); // Create a Mongoose model

// // Configure AWS Rekognition Client
// const client = new RekognitionClient({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// // Set up Multer for image uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Directory for storing uploads
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname); // Save with a unique filename
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     // Accept images only
//     if (!file.mimetype.startsWith('image/')) {
//       return cb(new Error('Only image files are allowed!'), false);
//     }
//     cb(null, true);
//   }
// });

// // Helper function to extract fields from text
// function extractField(text, label, type = 'string', additionalPattern = '') {
//   const regex = new RegExp(`${label}\\s*[:\\{]?\\s*([A-Za-z0-9/\\-. ]+${additionalPattern})`, 'i');
//   const match = text.match(regex);

//   if (!match) return type === 'number' ? NaN : (type === 'date' ? null : '');

//   let value = match[1].trim();

//   // Convert to the appropriate type
//   if (type === 'number') {
//     value = value.replace(/[^0-9.-]/g, '');
//     const numValue = parseFloat(value);
//     return isNaN(numValue) ? NaN : numValue;
//   }

//   if (type === 'date') {
//     const dateValue = new Date(value);
//     return isNaN(dateValue.getTime()) ? null : dateValue;
//   }

//   return value; // For strings
// }

// // Helper function to clean and remove redundant/duplicate texts
// function cleanExtractedText(extractedTexts) {
//   const uniqueTexts = [...new Set(extractedTexts.map(text => text.trim()))]; // Remove exact duplicates

//   // Remove near-duplicates based on length and common characters
//   const cleanedTexts = uniqueTexts.filter((text, index) => {
//     return !uniqueTexts.some((otherText, otherIndex) => 
//       otherIndex !== index && otherText.includes(text) && otherText.length > text.length
//     );
//   });

//   return cleanedTexts;
// }

// // Route to handle image uploads and analysis
// app.post('/analyze-image', upload.single('image'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No image uploaded.');
//   }

//   const imagePath = req.file.path;

//   // Read the original image as bytes
//   const imageBytes = fs.readFileSync(imagePath);
//   const params = {
//     Image: { Bytes: imageBytes },
//   };

//   const command = new DetectTextCommand(params);

//   try {
//     // Call AWS Rekognition to detect text
//     const data = await client.send(command);

//     // Extracted texts array
//     let extractedTexts = data.TextDetections.map((detection) => detection.DetectedText);

//     // Clean the extracted texts
//     const cleanedTexts = cleanExtractedText(extractedTexts);

//     // Join all cleaned text
//     const extractedText = cleanedTexts.join(', ');

//     console.log('Extracted Text:', extractedText);

//     // Extract each field from the cleaned, unique extracted text
//     const fullName = extractField(extractedText, 'Full Name');
//     const age = extractField(extractedText, 'Age', 'number');
//     const bloodPressure = extractField(extractedText, 'Blood Pressure', 'string', 'mm Hg|mmHg|mm lig');
//     const weight = extractField(extractedText, 'Weight', 'number');
//     const height = extractField(extractedText, 'Height', 'number');
//     const bmi = extractField(extractedText, 'Body Mass Index \\(BMI\\)', 'number');
//     const fetalHeartRate = extractField(extractedText, 'Fetal Heart Rate', 'number');
//     const bloodSugarLevel = extractField(extractedText, 'Blood Sugar Level', 'number');

//     // Validate and handle NaN values
//     const fieldsToValidate = { weight, bmi, fetalHeartRate, bloodSugarLevel, age };
//     for (let key in fieldsToValidate) {
//       if (isNaN(fieldsToValidate[key])) {
//         fieldsToValidate[key] = null; // Set NaN fields to null or a default value
//       }
//     }

//     // Create a new HealthRecord object
//     const newHealthRecord = new HealthRecord({
//       fullName,
//       age: fieldsToValidate.age,
//       bloodPressure,
//       weight: fieldsToValidate.weight,
//       height,
//       bmi: fieldsToValidate.bmi,
//       fetalHeartRate: fieldsToValidate.fetalHeartRate,
//       bloodSugarLevel: fieldsToValidate.bloodSugarLevel
//     });

//     // Save extracted data to MongoDB
//     await newHealthRecord.save();

//     console.log('Data saved successfully to the healthrecords collection');
    
//     res.json({ message: 'Data saved successfully', extractedData: newHealthRecord });

//   } catch (err) {
//     console.error('Error processing the image:', err);
//     res.status(500).send('Error processing the image');
//   }
// });

// // Prediction route
// app.post('/predict', (req, res) => {
//   const { age, bloodPressureSystolic, bloodPressureDiastolic, bmi, bloodSugarLevel, fetalHeartRate } = req.body;

//   // Validate the input values
//   if (!age || !bloodPressureSystolic || !bloodPressureDiastolic || !bmi || !bloodSugarLevel || !fetalHeartRate) {
//     return res.status(400).send('All input fields are required.');
//   }

//   // Prepare the options for PythonShell
//   const options = {
//     mode: 'text',
//     pythonOptions: ['-u'],
//     args: [age, bloodPressureSystolic, bloodPressureDiastolic, bmi, bloodSugarLevel, fetalHeartRate],
//   };

//   // Call the Python script for prediction
//   PythonShell.run('predict.py', options, (err, results) => {
//     if (err) {
//       console.error('Error during prediction:', err);
//       return res.status(500).send('Prediction failed.');
//     }

//     const prediction = results[0]; // Output from Python script
//     res.json({
//       message: 'Prediction successful',
//       prediction: prediction, // 0 = No risk, 1 = High risk
//     });
//   });
// });

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });



// require('dotenv').config(); // Load environment variables from .env file
// const express = require('express');
// const multer = require('multer');
// const { RekognitionClient, DetectTextCommand } = require('@aws-sdk/client-rekognition');
// const mongoose = require('mongoose');
// const fs = require('fs');
// const { PythonShell } = require('python-shell'); // Import PythonShell
// const cors = require('cors'); // Import CORS

// const app = express();
// const port = 5000;

// // Enable CORS for all requests
// app.use(cors({
//   origin: 'http://localhost:3000', // Allow requests from your frontend
//   methods: ['GET', 'POST'], // Specify allowed HTTP methods
// }));

// // Enable CORS for all routes
// app.use(cors({
//   origin: 'http://localhost:3000', // Allow requests only from localhost:3000 (your React app)
// }));

// // Middleware to parse JSON requests
// app.use(express.json());

// // MongoDB connection
// mongoose.connect(
//   "mongodb+srv://admin:7IejOoiRe6wmbr57@mmcaredb.rrvnwxo.mongodb.net/Node-API?retryWrites=true&w=majority&appName=MmCareDB"
// )
//   .then(() => console.log("Connected to MongoDB database!"))
//   .catch((error) => console.error("Connection to MongoDB failed!", error));

// // Define a schema for storing extracted data
// const healthRecordSchema = new mongoose.Schema({
//   fullName: String,
//   age: Number,
//   dateOfVisit: Date,
//   gestationalAge: Number,
//   gravidaParity: String,
//   bloodPressure: String,
//   weight: Number,
//   height: Number,
//   bmi: Number,
//   previousConditions: String,
//   currentMedications: String,
//   allergies: String,
//   fundalHeight: Number,
//   fetalHeartRate: Number,
//   positionOfBaby: String,
//   movementsOfBaby: String,
//   hemoglobinLevel: Number,
//   bloodSugarLevel: Number,
//   nextAppointmentDate: Date,
//   createdAt: { type: Date, default: Date.now }
// });

// const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema); // Create a Mongoose model

// // Configure AWS Rekognition Client
// const client = new RekognitionClient({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// // Set up Multer for image uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Directory for storing uploads
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname); // Save with a unique filename
//   },
// });

// const upload = multer({
//   storage,
//   fileFilter: (req, file, cb) => {
//     // Accept images only
//     if (!file.mimetype.startsWith('image/')) {
//       return cb(new Error('Only image files are allowed!'), false);
//     }
//     cb(null, true);
//   }
// });

// // Helper function to extract fields from text
// function extractField(text, label, type = 'string', additionalPattern = '') {
//   const regex = new RegExp(`${label}\\s*[:\\{]?\\s*([A-Za-z0-9/\\-. ]+${additionalPattern})`, 'i');
//   const match = text.match(regex);

//   if (!match) return type === 'number' ? NaN : (type === 'date' ? null : '');

//   let value = match[1].trim();

//   // Convert to the appropriate type
//   if (type === 'number') {
//     value = value.replace(/[^0-9.-]/g, '');
//     const numValue = parseFloat(value);
//     return isNaN(numValue) ? NaN : numValue;
//   }

//   if (type === 'date') {
//     const dateValue = new Date(value);
//     return isNaN(dateValue.getTime()) ? null : dateValue;
//   }

//   return value; // For strings
// }

// // Helper function to clean and remove redundant/duplicate texts
// function cleanExtractedText(extractedTexts) {
//   const uniqueTexts = [...new Set(extractedTexts.map(text => text.trim()))]; // Remove exact duplicates

//   // Remove near-duplicates based on length and common characters
//   const cleanedTexts = uniqueTexts.filter((text, index) => {
//     return !uniqueTexts.some((otherText, otherIndex) => 
//       otherIndex !== index && otherText.includes(text) && otherText.length > text.length
//     );
//   });

//   return cleanedTexts;
// }

// // Route to handle image uploads and analysis
// // app.post('/analyze-image', upload.single('image'), async (req, res) => {
// //   if (!req.file) {
// //     return res.status(400).send('No image uploaded.');
// //   }

// //   const imagePath = req.file.path;

// //   // Read the original image as bytes
// //   const imageBytes = fs.readFileSync(imagePath);
// //   const params = {
// //     Image: { Bytes: imageBytes },
// //   };

// //   const command = new DetectTextCommand(params);

// //   try {
// //     // Call AWS Rekognition to detect text
// //     const data = await client.send(command);

// //     // Extracted texts array
// //     let extractedTexts = data.TextDetections.map((detection) => detection.DetectedText);

// //     // Clean the extracted texts
// //     const cleanedTexts = cleanExtractedText(extractedTexts);

// //     // Join all cleaned text
// //     const extractedText = cleanedTexts.join(', ');

// //     console.log('Extracted Text:', extractedText);

// //     // Extract each field from the cleaned, unique extracted text
// //     const fullName = extractField(extractedText, 'Full Name');
// //     const age = extractField(extractedText, 'Age', 'number');
// //     const dateOfVisit = extractField(extractedText, 'Date of Visit', 'date');
// //     const gestationalAge = extractField(extractedText, 'Gestational Age \\(weeks\\)', 'number');
// //     const gravidaParity = extractField(extractedText, 'Gravida/Parity');
// //     const bloodPressure = extractField(extractedText, 'Blood Pressure', 'string', 'mm Hg|mmHg|mm lig');
// //     const weight = extractField(extractedText, 'Weight', 'number');
// //     const height = extractField(extractedText, 'Height', 'number');
// //     const bmi = extractField(extractedText, 'Body Mass Index \\(BMI\\)', 'number');
// //     const previousConditions = extractField(extractedText, 'Previous Medical Conditions');
// //     const currentMedications = extractField(extractedText, 'Current Medications');
// //     const allergies = extractField(extractedText, 'Allergies');
// //     const fundalHeight = extractField(extractedText, 'Fundal Height', 'number');
// //     const fetalHeartRate = extractField(extractedText, 'Fetal Heart Rate', 'number');
// //     const positionOfBaby = extractField(extractedText, 'Position of the Baby');
// //     const movementsOfBaby = extractField(extractedText, 'Movements of the Baby');
// //     const hemoglobinLevel = extractField(extractedText, 'Hemoglobin Level', 'number');
// //     const bloodSugarLevel = extractField(extractedText, 'Blood Sugar Level', 'number');
// //     const nextAppointmentDate = extractField(extractedText, 'Next Appointment Date', 'date');

// //     // Validate and handle NaN values
// //     const fieldsToValidate = { gestationalAge, bmi, fundalHeight, hemoglobinLevel, bloodSugarLevel, age };
// //     for (let key in fieldsToValidate) {
// //       if (isNaN(fieldsToValidate[key])) {
// //         fieldsToValidate[key] = null; // Set NaN fields to null
// //       }
// //     }

// //     // Create a new HealthRecord object
// //     const newHealthRecord = new HealthRecord({
// //       fullName,
// //       age: fieldsToValidate.age,
// //       dateOfVisit,
// //       gestationalAge: fieldsToValidate.gestationalAge,
// //       gravidaParity,
// //       bloodPressure,
// //       weight,
// //       height,
// //       bmi: fieldsToValidate.bmi,
// //       previousConditions,
// //       currentMedications,
// //       allergies,
// //       fundalHeight: fieldsToValidate.fundalHeight,
// //       fetalHeartRate,
// //       positionOfBaby,
// //       movementsOfBaby,
// //       hemoglobinLevel: fieldsToValidate.hemoglobinLevel,
// //       bloodSugarLevel: fieldsToValidate.bloodSugarLevel,
// //       nextAppointmentDate
// //     });

// //     // Save extracted data to MongoDB
// //     await newHealthRecord.save();

// //     console.log('Data saved successfully to the healthrecords collection');
// //     res.json({ message: 'Data saved successfully to the healthrecords collection', extractedText });

// //   } catch (err) {
// //     console.error('Error processing the image:', err);
// //     res.status(500).send('Error processing the image');
// //   }
// // });

// app.post('/analyze-image', upload.single('image'), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).send('No image uploaded.');
//   }

//   const imagePath = req.file.path;

//   const imageBytes = fs.readFileSync(imagePath);
//   const params = { Image: { Bytes: imageBytes } };
//   const command = new DetectTextCommand(params);

//   try {
//     // Call AWS Rekognition to detect text
//     const data = await client.send(command);

//     let extractedTexts = data.TextDetections.map((detection) => detection.DetectedText);
//     const cleanedTexts = cleanExtractedText(extractedTexts);
//     const extractedText = cleanedTexts.join(', ');

//     console.log('Cleaned Extracted Text:', extractedText);

//     // Extract relevant fields
//     const fullName = extractField(extractedText, 'Full Name');
//     const age = extractField(extractedText, 'Age', 'number');
//     const [sys, dia] = extractField(extractedText, 'Blood Pressure', 'string')
//       .split('/')
//       .map((val) => parseFloat(val.replace(/[^\d.-]/g, '')));
//     const bmi = parseFloat(extractField(extractedText, 'Body Mass Index \\(BMI\\)', 'number'));
//     const bloodSugarLevel = parseFloat(extractField(extractedText, 'Blood Sugar Level', 'number'));
//     const fetalHeartRate = parseFloat(extractField(extractedText, 'Fetal Heart Rate', 'number'));

//     // Validate and handle NaN values
//     const validValue = (val) => (isNaN(val) ? null : val);

//     const newHealthRecord = new HealthRecord({
//       fullName: fullName || 'Unknown',
//       age: validValue(age),
//       bloodPressure: `${sys || ''}/${dia || ''} mm Hg`,
//       bmi: validValue(bmi),
//       bloodSugarLevel: validValue(bloodSugarLevel),
//       fetalHeartRate: validValue(fetalHeartRate),
//     });

//     // Save to MongoDB
//     await newHealthRecord.save();
//     console.log('Data saved successfully to the healthrecords collection.');

//     res.json({ message: 'Data saved successfully', extractedData: newHealthRecord });

//   } catch (error) {
//     console.error('Error processing the image:', error);
//     res.status(500).send('Error processing the image');
//   }
// });



// // Prediction route
// // app.post('/predict', (req, res) => {
// //   const { age, bloodPressureSystolic, bloodPressureDiastolic, bmi, bloodSugarLevel, fetalHeartRate } = req.body;

// //   // Validate input values
// //   if (!age || !bloodPressureSystolic || !bloodPressureDiastolic || !bmi || !bloodSugarLevel || !fetalHeartRate) {
// //     return res.status(400).send('All input fields are required.');
// //   }

// //   const options = {
// //     mode: 'text',
// //     pythonOptions: ['-u'], // Get real-time output
// //     args: [age, bloodPressureSystolic, bloodPressureDiastolic, bmi, bloodSugarLevel, fetalHeartRate],
// //   };

// //   // Call the Python script for prediction
// //   PythonShell.run('predict.py', options, (err, results) => {
// //     if (err) {
// //       console.error('Error during prediction:', err);
// //       return res.status(500).send('Prediction failed.');
// //     }

// //     // Get the prediction result
// //     const prediction = results[0]; // 0 = No risk, 1 = High risk

// //     // Gather any warnings related to abnormal ranges
// //     const warnings = results.slice(1);

// //     res.json({
// //       message: 'Prediction successful',
// //       prediction: prediction === '1' ? 'High Risk' : 'No Risk',
// //       warnings: warnings.length > 0 ? warnings : 'No warnings',
// //     });
// //   });
// // });

// app.post('/predict', (req, res) => {
//   const {
//     age,
//     bloodPressureSystolic,
//     bloodPressureDiastolic,
//     bmi,
//     bloodSugarLevel,
//     fetalHeartRate,
//   } = req.body;

//   // Validate input fields
//   if (
//     [age, bloodPressureSystolic, bloodPressureDiastolic, bmi, bloodSugarLevel, fetalHeartRate].some(
//       (val) => isNaN(val) || val === null
//     )
//   ) {
//     return res.status(400).json({ error: 'Invalid input data. Please check the values.' });
//   }

//   const options = {
//     mode: 'text',
//     pythonOptions: ['-u'],
//     args: [
//       age,
//       bloodPressureSystolic,
//       bloodPressureDiastolic,
//       bmi,
//       bloodSugarLevel,
//       fetalHeartRate,
//     ],
//   };

//   PythonShell.run('predict.py', options, (err, results) => {
//     if (err) {
//       console.error('Prediction Error:', err);
//       return res.status(500).json({ error: 'Prediction failed.' });
//     }

//     const prediction = results[0];
//     res.json({ message: 'Prediction successful', prediction });
//   });
// });


// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });



require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const fs = require('fs');
const { PythonShell } = require('python-shell');
const bcrypt = require('bcrypt');

const app = express();
const port = 5000;

// Enable CORS for all requests
app.use(cors({ origin: 'http://localhost:3000', methods: ['GET', 'POST'] }));
app.use(express.json()); // Middleware to parse JSON requests

// MongoDB connection
mongoose.connect(
  "mongodb+srv://admin:7IejOoiRe6wmbr57@mmcaredb.rrvnwxo.mongodb.net/Node-API?retryWrites=true&w=majority&appName=MmCareDB"
).then(() => console.log("Connected to MongoDB database!"))
  .catch((error) => console.error("Connection to MongoDB failed!", error));

// Define schema for user registration data
const userRegistrationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const UserRegistration = mongoose.model('UserRegistration', userRegistrationSchema);

// User registration route
app.post('/register', async (req, res) => {
  const { name, email, password, address } = req.body;

  if (!name || !email || !password || !address) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // Encrypt password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user data to MongoDB
    const newUser = new UserRegistration({
      name,
      email,
      password: hashedPassword, // Save hashed password
      address,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed!' });
  }
});

// User login route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Check if the user exists in the database
    const user = await UserRegistration.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password.' });
    }

    res.json({ message: 'Login successful', user: user.name });
  } catch (error) {
    res.status(500).json({ error: 'Login failed. Please try again later.' });
  }
});

// Prediction route
app.post('/predict', (req, res) => {
  const {
    bloodPressureSystolic,
    bloodPressureDiastolic,
    bmi,
    bloodSugarLevel,
    fetalHeartRate,
  } = req.body;

  console.log('Received Prediction Request:', req.body);

  // Input validation to ensure no missing or NaN values
  if (
    [bloodPressureSystolic, bloodPressureDiastolic, bmi, bloodSugarLevel, fetalHeartRate].some(
      (val) => isNaN(val) || val == null
    )
  ) {
    console.log('Invalid input data received.');
    return res.status(400).json({ error: 'Invalid input data. Please check the values.' });
  }

  const options = {
    mode: 'text',
    pythonOptions: ['-u'], // Ensures unbuffered output
    args: [
      bloodPressureSystolic,
      bloodPressureDiastolic,
      bmi,
      bloodSugarLevel,
      fetalHeartRate,
    ],
  };

  // Run the Python script using PythonShell
  PythonShell.run('predict.py', options, (err, results) => {
    if (err) {
      console.error('Prediction Error:', err); // Log any errors
      return res.status(500).json({ error: 'Prediction failed.' });
    }

    console.log('Raw Prediction Results:', results); // Log raw results

    const prediction = results[0]?.trim(); // Capture the prediction (the first line of output)
    const warnings = results.slice(1).map((warning) => warning.trim()); // Capture warnings (subsequent lines)

    console.log('Parsed Prediction:', prediction); // Log parsed prediction
    console.log('Parsed Warnings:', warnings); // Log parsed warnings

    res.json({
      message: 'Prediction successful',
      prediction: prediction,
      warnings: warnings.length > 0 ? warnings : 'No warnings',
    });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


