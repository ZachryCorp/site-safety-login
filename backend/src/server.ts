import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();

// FIXED CORS configuration for Azure
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://gentle-dune-0f70ed110.2.azurestaticapps.net', // Your Azure Static Web App
    'https://gentle-dune-0f70ed110.azurestaticapps.net/', // With trailing slash just in case
    'https://gentle-dune-0f70ed110.1.azurestaticapps.net', // Alternative subdomain
    'https://gentle-dune-0f70ed110.2.azurestaticapps.net', // Your actual URL from the error
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));
app.use(express.json());

// Add logging middleware for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  next();
});

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Site Safety Login API is running',
    cors: 'Enabled for Azure Static Web Apps',
    timestamp: new Date().toISOString()
  });
});

// Check if user exists and their training status for a specific plant
app.post('/api/check-user', async (req: Request, res: Response) => {
  console.log('Check-user request received:', req.body);
  const { firstName, lastName, plant, email, phone } = req.body;

  if (!firstName || !lastName || !plant || !email || !phone) {
    console.log('Missing required fields');
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
      console.log('Creating new user:', email);
      // Create new user with plant field for backward compatibility
      user = await prisma.user.create({
        data: { 
          firstName, 
          lastName, 
          email, 
          phone,
          plant, // Store plant in user for backward compatibility
          trainingCompleted: false // Set initial training status
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
      console.log('Existing user found:', email);
      // Update user info if changed
      if (user.firstName !== firstName || user.lastName !== lastName || user.phone !== phone) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { 
            firstName, 
            lastName, 
            phone,
            plant // Update plant for current session
          },
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
        console.log('User needs training for plant:', plant);
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
      console.log('Training status:', needsTraining ? 'Incomplete' : 'Complete');
      
      return res.json({ 
        status: 'existing', 
        user,
        needsTraining,
        trainingRecord 
      });
    }
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Mark video as watched
app.post('/api/video-completed', async (req: Request, res: Response) => {
  console.log('Video-completed request received:', req.body);
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

    console.log('Video marked as watched for user:', email);
    return res.json({ success: true, trainingRecord });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Submit quiz and complete training
app.post('/api/submit-quiz', async (req: Request, res: Response) => {
  console.log('Submit-quiz request received:', req.body);
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

    // Update user's trainingCompleted field for backward compatibility
    if (passed) {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          trainingCompleted: true,
          plant // Update to current plant
        }
      });
    }

    console.log('Quiz submitted. Passed:', passed, 'Score:', score);
    return res.json({ 
      success: true, 
      passed,
      trainingRecord 
    });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get all users with their training records for admin portal
app.get('/api/users', async (req: Request, res: Response) => {
  console.log('Fetching users for admin portal');
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
        // Check both old trainingCompleted field and new trainingRecords
        const hasOldTraining = user.trainingCompleted === true;
        const hasNewTraining = user.trainingRecords.some(tr => tr.trainingCompleted);
        return (hasOldTraining || hasNewTraining) === trainedFilter;
      });
    }

    console.log(`Returning ${filteredUsers.length} users`);
    res.json(filteredUsers);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Get training statistics
app.get('/api/training-stats', async (req: Request, res: Response) => {
  console.log('Fetching training statistics');
  try {
    const stats = await prisma.$transaction(async (tx) => {
      const totalUsers = await tx.user.count();
      const totalTrainingRecords = await tx.trainingRecord.count();
      const completedTraining = await tx.trainingRecord.count({
        where: { trainingCompleted: true }
      });
      
      // Also count users with old trainingCompleted field
      const legacyCompletedTraining = await tx.user.count({
        where: { trainingCompleted: true }
      });
      
      const byPlant = await tx.trainingRecord.groupBy({
        by: ['plant'],
        _count: {
          _all: true
        },
        where: { trainingCompleted: true }
      });

      const totalCompleted = completedTraining + legacyCompletedTraining;
      const totalRecords = totalTrainingRecords + totalUsers;

      return {
        totalUsers,
        totalTrainingRecords: totalRecords,
        completedTraining: totalCompleted,
        completionRate: totalRecords > 0 
          ? Math.round((totalCompleted / totalRecords) * 100) 
          : 0,
        byPlant: byPlant.map(p => ({
          plant: p.plant,
          count: p._count._all
        }))
      };
    });

    console.log('Stats calculated successfully');
    res.json(stats);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

// Legacy endpoint for backward compatibility
app.post('/api/create-user', async (req: Request, res: Response) => {
  console.log('Legacy create-user request:', req.body);
  const { firstName, lastName, plant, email, phone } = req.body;

  try {
    const user = await prisma.user.upsert({
      where: { email: email || `${firstName}.${lastName}@temp.com` },
      update: {
        firstName,
        lastName,
        plant,
        phone: phone || 'N/A',
        trainingCompleted: true
      },
      create: {
        firstName,
        lastName,
        plant,
        email: email || `${firstName}.${lastName}@temp.com`,
        phone: phone || 'N/A',
        trainingCompleted: true
      }
    });

    // Also create a training record
    await prisma.trainingRecord.upsert({
      where: {
        userId_plant: {
          userId: user.id,
          plant
        }
      },
      update: {
        trainingCompleted: true,
        completedAt: new Date(),
        quizPassed: true,
        quizScore: 100
      },
      create: {
        userId: user.id,
        plant,
        trainingCompleted: true,
        completedAt: new Date(),
        quizPassed: true,
        quizScore: 100
      }
    });

    console.log('Legacy user created/updated:', user.email);
    return res.json({ success: true, user });
  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
  console.log('CORS enabled for:', corsOptions.origin);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});