// server.js
require('dotenv').config(); // load .env

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// parse form data and json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// serve static files from project root (adjust if your HTML is in a subfolder)
app.use(express.static(path.join(__dirname, '/')));

// Create transporter using env vars
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: (process.env.SMTP_SECURE === 'true'), // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

// Verify transporter (prints status to logs)
transporter.verify((err, success) => {
  if (err) {
    console.error('Mailer configuration error:', err);
  } else {
    console.log('Mailer is ready');
  }
});

app.post('/send-email', (req, res) => {
  const { email, message, name } = req.body;

  if (!name || !email || !message) {
    return res.status(400).send('Missing required fields');
  }

  const mailOptions = {
    from: `"Website Contact" <${process.env.SMTP_USER}>`, // sending account
    replyTo: `${name} <${email}>`,                       // user's address for replies
    to: process.env.TO_EMAIL,
    subject: `New Contact Form Message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).send('Oops! Something went wrong.');
    }
    console.log('Email sent:', info.response || info);
    res.send('Thank you! Your message has been sent.');
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
