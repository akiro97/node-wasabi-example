import { Sequelize } from 'sequelize';

const host = process.env.DB_HOST!;
const username = process.env.DB_USERNAME!;
const password = process.env.DB_PASSWORD!;
const db_name = process.env.DB_NAME!;

const dbConnect = new Sequelize(`${db_name}`, `${username}`, `${password}`, {
  host: `${host}`,
  dialect: 'mysql',
  // Add more configuration options if needed
});

export default dbConnect;