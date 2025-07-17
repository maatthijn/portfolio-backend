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

app.get('/', (req, res) => {
    res.send(`
    <html>
        <body>
            <h1>
                Hellow, World!
            </h1>
            <p>Server is running.</p>
        </body>
    </html>
    `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`)
});