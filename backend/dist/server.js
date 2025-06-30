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
// API route to check/add user
app.post('/api/check-user', async (req, res) => {
    const { firstName, lastName, plant, email, phone } = req.body;
    if (!firstName || !lastName || !plant || !email || !phone) {
        return res.status(400).json({ message: 'Missing fields' });
    }
    try {
        let user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            user = await prisma.user.create({
                data: { firstName, lastName, plant, email, phone },
            });
            return res.json({ status: 'new', user });
        }
        else {
            return res.json({ status: 'existing', user });
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
});
app.listen(5000, () => {
    console.log('Backend running on http://localhost:5000');
});
