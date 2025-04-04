// Запускать из корня проекта: node reset-admin-password.js
import { sequelize } from './server/config/database.js'
import User from './server/models/user.model.js'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

async function resetAdminPassword() {
  try {
    await sequelize.authenticate()
    console.log('Подключение к базе данных установлено.')

    const admin = await User.findOne({
      where: { email: 'admin@example.com' },
    })

    if (!admin) {
      console.log('Админ не найден, создаем нового...')
      const hashedPassword = await bcrypt.hash('admin123', 10)

      await User.create({
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'ADMIN',
      })

      console.log('Администратор успешно создан!')
    } else {
      console.log('Админ найден, обновляем пароль...')
      const hashedPassword = await bcrypt.hash('admin123', 10)

      admin.password = hashedPassword
      await admin.save()

      console.log('Пароль администратора успешно обновлен!')
    }

    await sequelize.close()
  } catch (error) {
    console.error('Ошибка:', error)
  }
}

resetAdminPassword()
