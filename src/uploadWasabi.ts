import * as fs from "fs";
import * as path from "path";
import * as dotenv from 'dotenv';
import { S3Client, PutObjectCommand, GetObjectCommand, GetObjectCommandOutput,  } from '@aws-sdk/client-s3';
import { Readable } from 'stream';


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


// Create global upload function option 1 -- Root bucket
export async function uploadImageViaBuffer(bucketName: string, key: string, fileBuffer: Buffer, mimeType: string) {
    try {
        const fileStream = Readable.from(fileBuffer);

         const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileStream,
            ContentType: mimeType,
    });

    const result = await client.send(command);
    
    console.log("upload successfully...!", result);

    return result;

    } catch (error) {
        console.error("Error uploading image: ",error);

    }
}

// CREATE:: upload option 2 --> Root Bucket
export async function uploadImageViaPath(bucketName: string, key: string, filePath: string) {
    try {
        const fileStream = fs.createReadStream(filePath);
        const fileMimeType = "image/*.png";

         const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: fileStream,
            ContentType: fileMimeType,
    });

    const result = await client.send(command);
    
    console.log("upload successfully...!", result);

    return result;

    } catch (error) {
        console.error("Error uploading image: ",error);

    }
}


// GET:: fetch file from wasabi bucket
export async function readFileFromWasabi(bucketName: string, key: string, filePath: string ) {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        const response: GetObjectCommandOutput = await client.send(command);

        // create a write stream to save file
        const fileStream = fs.createWriteStream(filePath);

        //Response body stream to the file stream
        (response.Body as Readable).pipe(fileStream); // What it this line?? how it worked?

        // Await for the file finish writting
        const data = await new Promise((resolve, reject) => {
            fileStream.on("finish", resolve);
            fileStream.on("error", reject)
        });

        return data;
    } catch (error) {
        console.error(`Error reading file from wasabi to ${filePath}`);
        throw error;
    }
}


// Function to create a folder in Wasabi
export async function createFolder(bucketName: string, folderName: string): Promise<void> {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `${folderName}/`, // Folder name with trailing slash
        Body: "", // Empty body
      });
      await client.send(command);
      console.log(`Folder '${folderName}' created in bucket '${bucketName}'.`);
    } catch (error) {
      console.error("Error creating folder in Wasabi:", error);
      throw error;
    }
}


// CRATE:: uplaod file to folder on wasabi
export async function uploadFileToWasabiFolder(bucketName: string, folderName: string, filePath: string) {
    try {
        const fileStream = fs.createReadStream(filePath);
        const fileName = path.basename(filePath);

        // 
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: `${folderName}/${fileName}`,
            Body: fileStream
        });

        const response = await client.send(command);

        console.log(`File '${fileName}' uploaded to folder '${folderName}' in bucket is successfully...!`);

        return response;
    } catch (error) {
        console.log("Error upload file to folder", error);
        throw error;
    }
}