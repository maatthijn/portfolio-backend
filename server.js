const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => { console.log("Connected to MongoDB.") })
    .catch((err) => { console.error(`MongoDB connection error: ${err}`) });

const blogRoutes = require('./routes/blogRoutes');
app.use('/api/blogs', blogRoutes);

const galleryRoutes = require('./routes/galleryRoutes');
app.use('/api/galleries', galleryRoutes);

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send(`
    <html>
        <body>
            <h1>
                Welcome to my portfolio's backend!
            </h1>
            <p>Server is running on port ${PORT}.</p>
            <p>You can check my API's in this site!</p>
            <p>Listed API:</p>
            <ol>
                <li>Blogs fetching API (/api/blogs)</li>
                <li>Galleries fetching API (/api/galleries)</li>
            </ol>
        </body>
    </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT} Kindly check http://localhost:${PORT}.`)
});