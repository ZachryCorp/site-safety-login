import express, { Request, Response } from 'express';

import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
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

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});

