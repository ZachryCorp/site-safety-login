"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Health check endpoint
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running', timestamp: new Date().toISOString() });
});
// API route to check if user is on site (no training check)
app.post('/api/check-on-site', async (req, res) => {
    const { email, plant } = req.body;
    if (!email || !plant) {
        return res.status(400).json({ message: 'Missing fields' });
    }
    try {
        // Check if user is currently on site (signed in but not signed out)
        const onSite = await prisma.user.findFirst({
            where: {
                email,
                plant,
                signedOutAt: null,
            },
            orderBy: { createdAt: 'desc' },
        });
        if (onSite) {
            return res.json({ status: 'on-site', visitorId: onSite.id });
        }
        return res.json({ status: 'off-site' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// API route to check user status (training + on-site status)
app.post('/api/check-user-status', async (req, res) => {
    const { email, plant } = req.body;
    if (!email || !plant) {
        return res.status(400).json({ message: 'Missing fields' });
    }
    try {
        // Check if user has completed training for this plant
        const hasTraining = await prisma.user.findFirst({
            where: {
                email,
                plant,
                trainingCompleted: true,
            },
        });
        if (!hasTraining) {
            return res.json({ status: 'needs-training' });
        }
        // Check if user is currently on site (signed in but not signed out)
        const onSite = await prisma.user.findFirst({
            where: {
                email,
                plant,
                signedOutAt: null,
            },
            orderBy: { createdAt: 'desc' },
        });
        if (onSite) {
            return res.json({ status: 'on-site', visitorId: onSite.id });
        }
        return res.json({ status: 'off-site' });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// API route to check if user exists and needs training
app.post('/api/check-user', async (req, res) => {
    const { firstName, lastName, plant, email, phone, meetingWith } = req.body;
    if (!firstName || !lastName || !plant || !email || !phone) {
        return res.status(400).json({ message: 'Missing fields' });
    }
    try {
        const existingTraining = await prisma.user.findFirst({
            where: {
                email,
                plant,
                trainingCompleted: true,
            },
        });
        if (existingTraining) {
            return res.json({ status: 'existing', user: existingTraining });
        }
        else {
            return res.json({ status: 'new' });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// API route for signing in (no training)
app.post('/api/sign-in', async (req, res) => {
    const { firstName, lastName, company, plant, email, phone, meetingWith } = req.body;
    if (!firstName || !lastName || !plant || !email || !phone) {
        return res.status(400).json({ message: 'Missing fields' });
    }
    try {
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                company: company || null,
                plant,
                email,
                phone,
                meetingWith: meetingWith || null,
                trainingCompleted: false,
            },
        });
        return res.json({ status: 'success', user });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// API route to submit quiz and complete training
app.post('/api/submit-quiz', async (req, res) => {
    const { firstName, lastName, company, plant, email, phone, meetingWith } = req.body;
    if (!firstName || !lastName || !plant || !email || !phone) {
        return res.status(400).json({ message: 'Missing fields' });
    }
    try {
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                company: company || null,
                plant,
                email,
                phone,
                meetingWith: meetingWith || null,
                trainingCompleted: true,
            },
        });
        // Return certificate data
        const trainingDate = new Date();
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        return res.json({
            status: 'success',
            user,
            certificate: {
                vNumber: `v-${user.id}`,
                firstName,
                lastName,
                company: company || 'N/A',
                plant,
                trainingDate: trainingDate.toLocaleDateString(),
                expirationDate: expirationDate.toLocaleDateString(),
                siteContact: meetingWith || 'N/A',
            },
        });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// API route to sign out a user
app.post('/api/sign-out/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { signedOutAt: new Date() },
        });
        return res.json({ status: 'success', user });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
// API route to get all users for the admin portal
app.get('/api/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log(`API available at http://localhost:${port}/api/test`);
});
