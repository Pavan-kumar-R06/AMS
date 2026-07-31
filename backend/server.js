import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import flatsRouter from "./routes/flats.js";
import ownersRouter from "./routes/owners.js";
import staffRouter from "./routes/staff.js";
import requestsRouter from "./routes/requests.js";
import parkingRouter from "./routes/parking.js";
import staffassignedRouter from "./routes/staff-assigned.js";
import staffProfileRouter from "./routes/staff-profile.js";
import staffUpdateRouter from "./routes/staff-update.js";
import adminDashboardRouter from "./routes/admin-dashboard.js";
import staffDashboardRouter from "./routes/staff-dashboard.js";
import authRouter from "./routes/auth.js";
import ownerDashboardRouter from "./routes/owner-dashboard.js";
import ownerRequestsRouter from "./routes/owner-my-requests.js";
import ownerServiceRouter from "./routes/owner-request-service.js";
import ownerFlatRouter from "./routes/owner-my-flat.js";
import accountRoutes from "./routes/account.js";
import usersRouter from "./routes/users.js";

const app = express();


app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());


// API Routes
app.use("/api/auth", authRouter);
app.use("/api/flats", flatsRouter);
app.use("/api/owners", ownersRouter);
app.use("/api/staff", staffRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/parking", parkingRouter);
app.use("/api/staff", staffassignedRouter);
app.use("/api/staff", staffProfileRouter);
app.use("/api/staff", staffUpdateRouter);
app.use("/api/admin-dashboard", adminDashboardRouter);
app.use("/api/staff", staffDashboardRouter);
app.use("/api/owner", ownerDashboardRouter);
app.use("/api/owner/requests", ownerRequestsRouter);
app.use("/api/owner", ownerServiceRouter);
app.use("/api/owner/my-flat", ownerFlatRouter);
app.use("/api/account", accountRoutes);
app.use("/api/users", usersRouter);

app.get("/api/test", (req, res) => {
    res.json({
        success: true,
        message: "Backend is updated"
    });
});

// 404 Route
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route Not Found"
    });
});

// Local Development Only
if (process.env.NODE_ENV !== "production") {
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export for Vercel
export default app;