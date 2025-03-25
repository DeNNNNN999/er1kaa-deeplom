import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'


dotenv.config()

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env

if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PASSWORD || !DB_NAME) {
  console.error('Missing database configuration. Please check your .env file.')
  process.exit(1)
}

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: DB_HOST,
  port: parseInt(DB_PORT),
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  logging: true, // Временно включаем логирование для отладки
})
