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
// API route for signing in (employees or returning visitors)
app.post('/api/sign-in', async (req, res) => {
    const { firstName, lastName, plant, email, phone, meetingWith, isEmployee } = req.body;
    if (!firstName || !lastName || !plant || !email || !phone) {
        return res.status(400).json({ message: 'Missing fields' });
    }
    try {
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                plant,
                email,
                phone,
                meetingWith: meetingWith || null,
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
    const { firstName, lastName, plant, email, phone, meetingWith } = req.body;
    if (!firstName || !lastName || !plant || !email || !phone) {
        return res.status(400).json({ message: 'Missing fields' });
    }
    try {
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                plant,
                email,
                phone,
                meetingWith: meetingWith || null,
            },
        });
        return res.json({ status: 'success', user });
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
