import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

// Updated CORS configuration to allow your Static Web App
app.use(cors({
  origin: [
    'https://gentle-dune-0f70ed110.2.azurestaticapps.net',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API route to check/add user
app.post('/api/check-user', async (req: Request, res: Response) => {
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
    } else {
      return res.json({ status: 'existing', user });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// API route to get all users for the admin portal
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Site Safety Login API is running' });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});