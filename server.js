const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require("dotenv").config();

const path = require('path');
const pingRoutes = require("./routes/pingRoutes");
const authRoutes = require("./routes/authRoutes");
const emailRoutes = require("./routes/emailRoutes");
const blogRoutes = require('./routes/blogRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.set('trust proxy', true);

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => { console.log("Connected to MongoDB.") })
    .catch((err) => { console.error(`MongoDB connection error: ${err}`) });

app.use('/api/blogs', blogRoutes);
app.use('/api/galleries', galleryRoutes);
app.use('/admin', express.static(path.join(__dirname, "admin")));
app.use('/api/ping', pingRoutes);
app.use('/api/login', authRoutes);
app.use('/api/contact', emailRoutes);

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, "admin", "index.html"));
})

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`)
});