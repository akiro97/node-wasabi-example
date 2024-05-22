import express, { Request, Response } from 'express';
import { listFolders } from '../providers/wasabi';

const bucketName = process.env.WASABI_BUCKET_NAME!;

export default class FolderApi {
    private static _instance: FolderApi;
    private readonly folderApi = express.Router();

    private constructor() {
        // FOLDERS Routers
        this.folderApi.get("/", async(req: Request, res: Response) => {
            try {
                const bucket = bucketName;
                const prefix = "";
        
                const folders = await listFolders(bucket, prefix);
        
                res.status(200).send(folders);
            } catch (error) {
                console.error("can not fetch folders from wasabi bucket", error);
                throw error;
            }
        });

        this.folderApi.post("/", async(req: Request, res: Response) => {
          try {
            
          } catch (error) {
            console.error("can not fetch folders from wasabi bucket", error);
            throw error;
          }
        })
    } 

    public static InitfolderApi(): FolderApi {
        if(this._instance) return this._instance;

        this._instance = new FolderApi();
        return this._instance;
    }

    public commitFolderApi() {
        return this.folderApi;
    }
}