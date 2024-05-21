import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config()


const host = process.env.DB_HOST!;
const username = process.env.DB_USERNAME!;
const password = process.env.DB_PASSWORD!;
const db_name = process.env.DB_NAME!;

const sequelize = new Sequelize(`${db_name}`, `${username}`, `${password}`, {
  host: `${host}`,
  dialect: 'mysql',
  // Add more configuration options if needed
});

sequelize
 .authenticate()
 .then(() => {
  console.log("DATABASE CONNECTED");
 })
 .catch((err) => {
  console.log(err);
 });

export default sequelize;