import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import expressUpload from 'express-fileupload';
import * as fs from "fs";
import * as path from "path";
import * as dotenv from 'dotenv';
import multer from 'multer';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { readFileFromWasabi, createFolder, uploadFileToWasabiFolder, uploadImageViaPath } from './uploadWasabi';
import { S3Client } from "@aws-sdk/client-s3";

// ENVIROMENT
dotenv.config();

// ENVIRONMENT UPLOAD 
const accessKeyId = process.env.WASABI_ACCRESS_KEY!;
const secretKey = process.env.WASABI_SECRET_KEY!;
const region = process.env.WASABI_REGION!;
const endpoint = process.env.WASABI_UPLOAD_URL!;


// Config S3 -- v2
const client = new S3Client({
    region: region,
    endpoint: endpoint,
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretKey
    }
});


//Config Multer
const storage = multer.diskStorage({
    destination: (_req: Request, _file, cb) => {
        cb(null, "public/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });
const bucketName = process.env.WASABI_BUCKET_NAME!
const app = express();
const port = process.env.PORT;

// CREATE --> Directory for storage files
const dir = './public';
if(!fs.existsSync(dir)){
    fs.mkdirSync(dir);
} 

app.use(cookieParser());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname + "./public"));


// Routes
app.get("/", (req: Request, res: Response) => {
    res.send("application is healthy...!")
});

// CREATE:: upload file streaming --> Root Bucket
app.post("/upload", upload.single("file"), async (req: Request, res: Response) => {
   try {
    const file = req.file;
    const key = file?.originalname!;
    const filePath = "/public";

    console.log("file from multer request: ", file)

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const base64Data = new Buffer(JSON.stringify(file)).toString("base64");


        // console.log('buffer:', file.buffer.toString('base64'))
        // console.log('buffer:', file.buffer.toString('utf8'))
        // console.log('file:', file)

        console.log(base64Data);

    // Test by use command
    const commeand = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: file.originalname,
        ContentType: file.mimetype,
    });

    const response = await client.send(commeand);
    
    // const response = await uploadImageViaPath(bucketName, key, fileBuffer,  mimeType);
    // const response = await uploadImageViaPath(bucketName, key,  filePath);
    
    res.send(response);

   } catch (error) {
    console.error(error);
    throw error;
   }
});


// GET:: reading file from wasabi
app.get("/download", async (req: Request, res: Response) => {
    try {
        const bucket = bucketName;
        const key = "example.txt";
        const filePath = "./public/example.txt";

        const response = await readFileFromWasabi(bucket, key, filePath);

        res.send(response);
    } catch (error) {
        console.error("can not read file from wasabi", error);
        throw error;
    }
});


// CREATE:: user create owner folder
app.post("/create-folder", async (req: Request, res: Response) => {
    try {
        const bucket = bucketName;
        const folderName = "sbd-folder";

        const response = await createFolder(bucket, folderName);

        res.send(response);
    } catch (error) {
        console.error("can not create folder to wasabi bucket", error);
        throw error;
    }
});

// CREATE:: upload file to node folder
app.post("/folders/:folderName/upload", async (req: Request, res: Response) => {
    try {
        const bucket = bucketName;
        const folderName = req.params.folderName;
        const filePath = "public/1715913489789-Screenshot 2024-05-15 141657.png"; // file from local device path

        const result = await uploadFileToWasabiFolder(bucket, folderName, filePath);

        res.send(result);
    } catch (error) {
        console.log("Error upload file to folder", error);
        throw error;
    }
});

// CREATE:: upload multiple files streaming
app.post("/multi-upload", upload.array("files"), (req: Request, res: Response) => {
    res.send("file upload successfully...!")
});



app.listen(port, () => {
    console.log(`Server is Started on http://localhost:${port}`)
});
