require("dotenv").config();
const express = require('express');
const cors = require("cors");
const mongoose = require("mongoose");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URL, function(err) {

        if (err) { throw err; }

    })
    .then(() => console.log("Connexion à MongoDB réussie !"))
    .catch(() => console.log("Connexion à MongoDB échouée !"));
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("connecté à Mongoose")
});

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/api/user", userRoute);
app.use("/api/auth", authRoute);


app.listen(process.env.PORT || 4200, () => {
    console.log("Server started on port 4200  ");
});