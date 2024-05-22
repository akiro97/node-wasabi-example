import archiver from 'archiver';
import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config();

const wasabiHost = process.env.WASABI_UPLOAD_UR!;
const region = process.env.WASABI_REGION!;

export async function addFolderToZip( archive: any, storageZoneName: any, path: string, AccessKey: any, rootPath: any, zipRoot: any, sendProgress: any, nameMapping: any) {
    const lisUrl = `${wasabiHost}/${region}/${path}/`;
    const listResponse = await axios.get(lisUrl, {
        headers: {
            AccessKey: AccessKey
        }
    });

    const items = listResponse.data;

    for(const [index, item] of items.entries()) {
        if (item.IsDirectory) {
            await addFolderToZip(
              archive,
              storageZoneName,
              `${path}/${item.ObjectName}`,
              AccessKey,
              rootPath,
              zipRoot,
              sendProgress,
              nameMapping
            );
          } else {
            const fileUrl = `${wasabiHost}/${region}/${path}/${item.ObjectName}`;
            const fileResponse = await axios.get(fileUrl, {
              headers: {
                AccessKey: AccessKey,
              },
              responseType: "stream",
            });
            let filePath = `${zipRoot}${path}/${item.ObjectName}`.replace(
              rootPath,
              ""
            );
            filePath = filePath
              .split("/")
              .map((part) => nameMapping[part] || part)
              .join("/");
            archive.append(fileResponse.data, { name: filePath });
          }
          sendProgress(Math.round(((index + 1) / items.length) * 100));
    }

}

export async function getFileType(filename: any) {
    const extension = filename.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(extension)) {
      return "image";
    } else if (["pdf"].includes(extension)) {
      return "pdf";
    } else if (["mp4", "avi", "mov", "wmv", "mkv"].includes(extension)) {
      return "video";
    }
    // Add more cases for other file types if needed
  }