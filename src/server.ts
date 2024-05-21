import * as dotenv from 'dotenv';
dotenv.config();


// SERVET Start and Load balancer --> Next staging is loadbalancer
import app from "./app";

// Connection Redis --> next step


// Connection to database --> step

// const app = app.getInstance().getApp();
const port = process.env.PORT || 4002;

process.on("uncaughtException", (error) => console.log("uncaughtException: ", error));

// Create Server and run for endpoint
const serverStarter = async () => {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}

serverStarter();