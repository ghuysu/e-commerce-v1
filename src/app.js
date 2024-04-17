const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const chokidar = require("chokidar");

const authRouter = require("./routes/auth");
const storeRouter = require("./routes/store");
const userRouter = require("./routes/user");
const deleteFile = require("./utils/deleteFile");

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        if(file.mimetype === "image/png" ||
           file.mimetype === "image/jpg" ||
           file.mimetype === "image/jpeg")
        {
            cb(null, "src/public/images");
        }
        else if(file.mimetype === "video/mp4"){
            cb(null, "src/public/videos");
        }
        else{
            cb(new Error("Invalid file type"));
        }
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + "-" + file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === "image/png" ||
       file.mimetype === "image/jpg" ||
       file.mimetype === "image/jpeg" ||
       file.mimetype === "video/mp4")
    {
        cb(null, true);
    }
    else{
        cb(null, false);
    }
};

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(multer({storage: fileStorage, fileFilter: fileFilter}).fields([
    { name: 'images', maxCount: 10 },
    { name: 'video', maxCount: 1 }
]));
app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use("/videos", express.static(path.join(__dirname, "public", "videos")));

chokidar.watch('.').on('all', (event, path) => {
  console.log(event, path);
});

app.use("/auth", authRouter);
app.use("/store", storeRouter);
app.use(userRouter);

app.use((error, req, res, next) => {
    console.error("ERROR:", error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    if(req.files){
        if(req.files.images)
            req.files.images.forEach(image => deleteFile(image.path));
        if(req.files.video){
            deleteFile(req.files.video[0].path)
        }
    }
    res.status(status).json({ message: message, data: data });
});


mongoose.connect("mongodb+srv://daogiahuysu:HuyUyen-07021011@cluster0.ibftatx.mongodb.net/e-commerce")
    .then(connection => {
        const server = app.listen(8080);
        console.log("CONNECTED MONGODB");
    })
    .catch(err => {
        console.log("CONNECTION FAILED")
    })

