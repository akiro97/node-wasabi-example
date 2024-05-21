import { Request } from 'express';
import multer from 'multer';


//Config Multer
const storage = multer.diskStorage({
    destination: (_req: Request, _file, cb) => {
        cb(null, "public/");
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});


export default storage;