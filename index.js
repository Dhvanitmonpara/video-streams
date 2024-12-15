import express from "express";
import cors from "cors";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import fs from "fs";
import { exec } from "child_process";

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "http://localhost:5173")
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next();
})
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname));
    },
})

const upload = multer({ storage: storage })

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.post("/upload", upload.single("file"), (req, res) => {
    const lessonId = uuidv4()
    const videoPath = req.file.path
    const outputPath = `./uploads/courses/${lessonId}`
    const hslPath = `${outputPath}/index.m3u8`

    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true })
    }

    const ffmpegCommand = `ffmpeg -i ${videoPath} -codec:v libx264 -codec:a aac -hls_time 10 -hls_playlist_type vod -hls_segment_filename ${outputPath}/segment%03d.ts -start_number 0 ${hslPath}`

    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            console.log(`exec error: ${error}`);
        }
        console.log(`stderr: ${stderr}`);
        console.log(`stdout: ${stdout}`);

        const videoUrl = `http://localhost:8000/uploads/courses/${lessonId}/index.m3u8`

        res.json({
            message: "Video processed successfully",
            videoUrl,
            lessonId
        })

    })

});

app.listen(8000, () => {
    console.log("Server is running on port 8000");
});