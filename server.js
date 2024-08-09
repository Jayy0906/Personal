const express = require("express");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static("public")); // Serve static files from the "public" directory

app.post("/send-email", (req, res) => {
  const { name, email, message } = req.body;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "patljoy8@gmail.com", // Replace with your email
      pass: "btae nulb iaun pbgc", // Replace with your email password or app password
    },
  });

  // Email to the agency
  const mailOptionsToAgency = {
    from: email,
    to: "patljoy8@gmail.com",
    subject: `Contact Form Submission from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  };

  // Confirmation email to the user
  const mailOptionsToUser = {
    from: "patljoy8@gmail.com",
    to: email,
    subject: `Welcome to MetaArt '${name}'`,
    text: `Dear ${name},\n\nThank you for reaching out to us. We have received your message and will get back to you as soon as possible.\n\nYour message:\n${message}\n\nBest regards,\nMetaArt Team`,
  };

  // Send email to the agency
  transporter.sendMail(mailOptionsToAgency, (error, info) => {
    if (error) {
        return res.status(500).send('Error sending email: ' + error.message);
    }
    // Send confirmation email to the user
    transporter.sendMail(mailOptionsToUser, (error, info) => {
        if (error) {
            return res.status(500).send('Error sending confirmation email: ' + error.message);
        }
        res.status(200).send('Email sent successfully!');
    });
});
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
