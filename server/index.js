import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { sequelize } from './config/database.js'
import './models/index.js'
import authRoutes from './routes/auth.routes.js'
import tourRoutes from './routes/tours.routes.js'
import categoryRoutes from './routes/categories.routes.js'
import bookingRoutes from './routes/bookings.routes.js'
import adminRoutes from './routes/admin.routes.js'
import reviewRoutes from './routes/reviews.routes.js'
import paymentRoutes from './routes/payments.routes.js'
import adminLocationsRoutes from './routes/admin/locations.routes.js'
import adminDiscountsRoutes from './routes/admin/discounts.routes.js'
import adminRefundsRoutes from './routes/admin/refunds.routes.js'
import adminTourDatesRoutes from './routes/admin/tourDates.routes.js'
import managerReviewsRoutes from './routes/manager/reviews.routes.js'
import managerAnalyticsRoutes from './routes/manager/analytics.routes.js'
import managerPaymentsRoutes from './routes/manager/payments.routes.js'
import adminBookingsRoutes from './routes/admin/bookings.routes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())

// Статические файлы для изображений
app.use('/uploads', express.static('uploads'))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/tours', tourRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin/locations', adminLocationsRoutes)
app.use('/api/admin/discounts', adminDiscountsRoutes)
app.use('/api/admin/refunds', adminRefundsRoutes)
app.use('/api/admin/tour-dates', adminTourDatesRoutes)
app.use('/api/manager/reviews', managerReviewsRoutes)
app.use('/api/manager/analytics', managerAnalyticsRoutes)
app.use('/api/manager/payments', managerPaymentsRoutes)
app.use('/api/admin/bookings', adminBookingsRoutes)

// Database connection and server start
async function startServer() {
  try {
    console.log('Attempting to connect to database...')
    await sequelize.authenticate()
    console.log('Database connection established successfully.')

    // Sync database models
    console.log('Syncing database models...')
    await sequelize.sync({ alter: true })
    console.log('Database models synchronized.')

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`)
    })
  } catch (error) {
    console.error('Unable to start server. Database error:', error.message)
    process.exit(1)
  }
}

startServer()
