import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Backend is running', timestamp: new Date().toISOString() });
});

// API route to check if user exists and needs training
app.post('/api/check-user', async (req: Request, res: Response) => {
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
    } else {
      return res.json({ status: 'new' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// API route for signing in (employees or returning visitors)
app.post('/api/sign-in', async (req: Request, res: Response) => {
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// API route to submit quiz and complete training
app.post('/api/submit-quiz', async (req: Request, res: Response) => {
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
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// API route to sign out a user
app.post('/api/sign-out/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { signedOutAt: new Date() },
    });

    return res.json({ status: 'success', user });
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

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  console.log(`API available at http://localhost:${port}/api/test`);
});