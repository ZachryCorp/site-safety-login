import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Check if user exists and their training status for a specific plant
app.post('/api/check-user', async (req: Request, res: Response) => {
  const { firstName, lastName, plant, email, phone } = req.body;

  if (!firstName || !lastName || !plant || !email || !phone) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        trainingRecords: {
          where: { plant }
        }
      }
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: { 
          firstName, 
          lastName, 
          email, 
          phone 
        },
        include: {
          trainingRecords: true
        }
      });

      // Create training record for this plant
      await prisma.trainingRecord.create({
        data: {
          userId: user.id,
          plant
        }
      });

      return res.json({ 
        status: 'new', 
        user,
        needsTraining: true 
      });
    } else {
      // Update user info if changed
      if (user.firstName !== firstName || user.lastName !== lastName || user.phone !== phone) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { firstName, lastName, phone },
          include: {
            trainingRecords: {
              where: { plant }
            }
          }
        });
      }

      // Check if user has completed training for this plant
      const trainingRecord = user.trainingRecords[0];
      
      if (!trainingRecord) {
        // User exists but hasn't trained for this plant
        await prisma.trainingRecord.create({
          data: {
            userId: user.id,
            plant
          }
        });
        
        return res.json({ 
          status: 'existing', 
          user,
          needsTraining: true 
        });
      }

      // Check if training is complete
      const needsTraining = !trainingRecord.trainingCompleted;
      
      return res.json({ 
        status: 'existing', 
        user,
        needsTraining,
        trainingRecord 
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Mark video as watched
app.post('/api/video-completed', async (req: Request, res: Response) => {
  const { email, plant } = req.body;

  if (!email || !plant) {
    return res.status(400).json({ message: 'Missing email or plant' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const trainingRecord = await prisma.trainingRecord.upsert({
      where: {
        userId_plant: {
          userId: user.id,
          plant
        }
      },
      update: {
        videoWatched: true,
        videoCompletedAt: new Date()
      },
      create: {
        userId: user.id,
        plant,
        videoWatched: true,
        videoCompletedAt: new Date()
      }
    });

    return res.json({ success: true, trainingRecord });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz and complete training
app.post('/api/submit-quiz', async (req: Request, res: Response) => {
  const { email, plant, score } = req.body;

  if (!email || !plant || score === undefined) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Quiz is passed if score is 100 (all answers correct)
    const passed = score === 100;
    const now = new Date();

    const trainingRecord = await prisma.trainingRecord.update({
      where: {
        userId_plant: {
          userId: user.id,
          plant
        }
      },
      data: {
        quizPassed: passed,
        quizScore: score,
        quizCompletedAt: now,
        trainingCompleted: passed,
        completedAt: passed ? now : null
      }
    });

    return res.json({ 
      success: true, 
      passed,
      trainingRecord 
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with their training records for admin portal
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const { plant, trained } = req.query;
    
    const users = await prisma.user.findMany({
      include: {
        trainingRecords: {
          where: plant ? { plant: plant as string } : undefined,
          orderBy: { updatedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Filter by training status if requested
    let filteredUsers = users;
    if (trained !== undefined) {
      const trainedFilter = trained === 'true';
      filteredUsers = users.filter(user => {
        if (user.trainingRecords.length === 0) return !trainedFilter;
        return user.trainingRecords.some(tr => tr.trainingCompleted) === trainedFilter;
      });
    }

    res.json(filteredUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get training statistics
app.get('/api/training-stats', async (req: Request, res: Response) => {
  try {
    const stats = await prisma.$transaction(async (tx) => {
      const totalUsers = await tx.user.count();
      const totalTrainingRecords = await tx.trainingRecord.count();
      const completedTraining = await tx.trainingRecord.count({
        where: { trainingCompleted: true }
      });
      
      const byPlant = await tx.trainingRecord.groupBy({
        by: ['plant'],
        _count: {
          _all: true
        },
        where: { trainingCompleted: true }
      });

      return {
        totalUsers,
        totalTrainingRecords,
        completedTraining,
        completionRate: totalTrainingRecords > 0 
          ? Math.round((completedTraining / totalTrainingRecords) * 100) 
          : 0,
        byPlant: byPlant.map(p => ({
          plant: p.plant,
          count: p._count._all
        }))
      };
    });

    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});