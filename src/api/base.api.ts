import express, { Request, Response } from 'express';
import folderApi from './folders.api';

export default class Api {
    private static _instance: Api;
    private readonly api = express.Router();

    private constructor() {
        // FOLDERS Routers
        this.api.use("/folders", folderApi.InitfolderApi().commitFolderApi());
    } 

    public static InitApi(): Api {
        if(this._instance) return this._instance;

        this._instance = new Api();
        return this._instance;
    }

    public commitApi() {
        return this.api;
    }
}