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
  const { firstName, lastName, plant, email, phone, meetingWith } = req.body;

  if (!firstName || !lastName || !plant || !email || !phone) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user - only include meetingWith if your database schema has this field
      const userData: any = { 
        firstName, 
        lastName, 
        plant, 
        email, 
        phone
      };
      
      // Uncomment the next line if your database has a meetingWith field
      // if (meetingWith) userData.meetingWith = meetingWith;
      
      user = await prisma.user.create({
        data: userData,
      });
      return res.json({ status: 'new', user });
    } else {
      // User exists - optionally update meetingWith if needed
      // Uncomment if you want to update the meetingWith field for existing users
      /*
      if (meetingWith) {
        user = await prisma.user.update({
          where: { email },
          data: { meetingWith }
        });
      }
      */
      return res.json({ status: 'existing', user });
    }
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ message: 'Server error', error: err });
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
    console.error('Error fetching users:', err);
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

// Add this API route for sign out
app.post('/api/sign-out', async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const user = await prisma.user.update({
      where: { email },
      data: { 
        signedOutAt: new Date()
      },
    });
    return res.json({ status: 'success', message: 'Signed out successfully' });
  } catch (err) {
    console.error('Sign out error:', err);
    return res.status(404).json({ message: 'User not found' });
  }
});