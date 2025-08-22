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
//  Check/add or update user on login
app.post('/api/check-user', async (req, res) => {
    const { firstName, lastName, plant, email, phone, meetingWith } = req.body;
    if (!firstName || !lastName || !plant || !email || !phone) {
        return res.status(400).json({ message: 'Missing fields' });
    }
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (!existingUser) {
            const newUser = await prisma.user.create({
                data: {
                    firstName,
                    lastName,
                    plant,
                    email,
                    phone,
                    meetingWith,
                },
            });
            return res.json({ status: 'new', user: newUser });
        }
        else {
            const updatedUser = await prisma.user.update({
                where: { email },
                data: {
                    firstName,
                    lastName,
                    plant,
                    phone,
                    meetingWith,
                    signedOutAt: null, // reset on new sign-in
                    createdAt: new Date(), // refresh login time
                },
            });
            return res.json({ status: 'existing', user: updatedUser });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
//  Get currently signed-in users
app.get('/api/users', async (_req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: { signedOutAt: null },
            orderBy: { createdAt: 'desc' },
        });
        res.json(users);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});
// Sign out by ID (admin panel use)
app.post('/api/signout/:id', async (req, res) => {
    const id = Number(req.params.id);
    if (!id)
        return res.status(400).json({ message: 'Invalid user ID' });
    try {
        const updated = await prisma.user.update({
            where: { id },
            data: { signedOutAt: new Date() },
        });
        res.json({ message: 'Signed out successfully', user: updated });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during sign-out' });
    }
});
//  Sign out by name (SignOut page use)
app.post('/api/signout-by-name', async (req, res) => {
    const { firstName, lastName } = req.body;
    if (!firstName || !lastName) {
        return res.status(400).json({ message: 'First and last name are required.' });
    }
    try {
        const user = await prisma.user.findFirst({
            where: {
                firstName: { contains: firstName },
                lastName: { contains: lastName },
                signedOutAt: null,
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!user) {
            return res.status(404).json({ message: 'User not found or already signed out.' });
        }
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: { signedOutAt: new Date() },
        });
        res.json({ message: 'Signed out successfully', user: updated });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
});
