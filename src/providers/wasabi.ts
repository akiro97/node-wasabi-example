import * as fs from "fs";
import * as path from "path";
import * as dotenv from 'dotenv';
import { S3Client, 
    PutObjectCommand, 
    GetObjectCommand, 
    GetObjectCommandOutput,
    ListObjectsV2Command, 
    ListObjectsV2CommandOutput,
    DeleteObjectsCommand,  
} from '@aws-sdk/client-s3';
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

// WORK WITH BUCKETS


// WORK WITH FOLDERS IN BUCKET


// WORK WITH OBJECTS IN BUCKET


// WORK WITH FOLDERS


// WORK WITH OBJECTS IN FOLDER


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


// upload file to wasabi folder
export async function uploadFileToFolder(bucketName: string, folderName: string, file: Express.Multer.File) {
    const uploadParams = {
            Bucket: bucketName,
            Key: `${folderName}/${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype
    }
    try {
     const command = new PutObjectCommand(uploadParams);
     
     const response = await client.send(command);

     return response;
    } catch (error) {
        console.error(`Error upload file to wasabi ${folderName}`);
        throw error;
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
export async function createFolder(bucketName: string, folderName: string) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: `${folderName}/`, // Folder name with trailing slash
        Body: "", // Empty body
      });
      const results = await client.send(command);
      console.log(`Folder '${folderName}' created in bucket '${bucketName}'.`);

      return results;
    } catch (error) {
      console.error("Error creating folder in Wasabi:", error);
      throw error;
    }
}


// GET:: fetching folders list from buckets
export async function listFolders(bucketName: string, prefix: string = ''): Promise<string[]> {
    let folders: Set<string> = new Set();
    let continuationToken: string | undefined = undefined;
    try {
        do {
            const command = new ListObjectsV2Command({
                Bucket: bucketName,
                Prefix: prefix,
                Delimiter: '/',
                ContinuationToken: continuationToken,
            });

            const response: ListObjectsV2CommandOutput = await client.send(command);

            if(response.CommonPrefixes) {
                response.CommonPrefixes.forEach(commonPrefix => {
                    if(commonPrefix.Prefix) {
                        folders.add(commonPrefix.Prefix);
                    }
                });
            }

            continuationToken = response.NextContinuationToken;
        }while (continuationToken);


        return Array.from(folders);
    } catch (error) {
        console.error("Error fetch folder lists from bucket", error);
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


// GET:: list all object from wasabi bucket
export async function listObjects(bucketName: string, prefix: string): Promise<ListObjectsV2CommandOutput> {
    try {
        const command = new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix
        });

        const response = await client.send(command);

        return response;
    } catch (error) {
        console.log("Error list object from folder", error);
        throw error;
    }
}

// DELETE:: delete object from wasabi bucket
export async function deleteObjects(bucketName: string, keys: string[]) {
    const objects = keys.map((key) => ({ Key: key}));

    //
    const command = new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: {
            Objects: objects
        }
    });

    const result = await client.send(command);

    return result;
} 


// DELETE:: to delete folder from wasabi bucket --> Check if empty folder else delete objects
export async function deleteFolder(bucketName: string, folderName: string) {
    try {

        let continuattionToken: string | undefined = undefined;

        // Check foder is empty
        do {
            const listResponseObjects = await listObjects(bucketName, folderName);
            const objects = listResponseObjects.Contents || [];

            if(objects.length > 0) {
                const keys = objects.map((object) => object.Key!);

                const resp = await deleteObjects(bucketName, keys);

                console.log(`Deleted '${keys.length}' objects from folder '${folderName}'`);

                return resp;
            }
            
            continuattionToken =  listResponseObjects.NextContinuationToken;
            
        }while (continuattionToken);

        console.log(`Folder '${folderName}' and all its contents deleted from bucket '${bucketName}'`)

        // Try to find th way to response some of logical message or data back frontend

    } catch (error) {
        console.log("Error delete folder from bucket", error);
        throw error;
    }
}