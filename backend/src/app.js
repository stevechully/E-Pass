import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { errorHandler } from './middlewares/error.middleware.js';
import healthRoutes from './routes/health.routes.js';
import entrySlotRoutes from './routes/entry-slots.routes.js';
import epassRoutes from './routes/epass.routes.js';
import foodSlotRoutes from './routes/food-slots.routes.js';
import foodRoutes from './routes/food.routes.js';
import accommodationRoutes from './routes/accommodations.routes.js';
import accommodationBookingRoutes from './routes/accommodation.routes.js';
import ecoRoutes from './routes/eco.routes.js';
import cancellationRoutes from './routes/cancellation.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import adminRoutes from "./routes/admin.routes.js";
import adminAccommodationRoutes from "./routes/admin.accommodation.routes.js";
import adminRefundRoutes from './routes/admin.refund.routes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api', healthRoutes); 
app.use('/api/entry-slots', entrySlotRoutes);
app.use('/api/epass', epassRoutes);
app.use('/api/food-slots', foodSlotRoutes);
app.use('/api/food', foodRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/accommodation', accommodationBookingRoutes);
app.use('/api/eco', ecoRoutes);
app.use('/api/cancel', cancellationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Admin Routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/accommodations", adminAccommodationRoutes);
app.use('/api/admin/refunds', adminRefundRoutes);

app.use(errorHandler);

export default app;