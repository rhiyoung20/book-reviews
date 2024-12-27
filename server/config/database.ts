import { Sequelize } from 'sequelize';
import { env } from '../env';

const sequelize = new Sequelize({
  database: env.database.name || 'book_review',
  username: env.database.user || 'root',
  password: env.database.password || '',
  host: env.database.host || 'localhost',
  port: parseInt(env.database.port || '3306', 10),
  dialect: 'mysql',
  dialectModule: require('mysql2'),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  logging: (sql) => console.log('[DB Query]:', sql)
});

export default sequelize;