import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { sendSignInEmail, sendSignOutEmail, sendOvertimeNotification } from './emailService';

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

//  Check/add or update user on login
app.post('/api/check-user', async (req: Request, res: Response) => {
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
      
      // Send sign-in email notification
      try {
        await sendSignInEmail({
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          plant: newUser.plant,
          email: newUser.email,
          phone: newUser.phone,
          meetingWith: newUser.meetingWith || undefined,
          createdAt: newUser.createdAt,
        });
        console.log(`Sign-in email sent for ${firstName} ${lastName}`);
      } catch (emailError) {
        console.error('Failed to send sign-in email:', emailError);
        // Don't fail the request if email fails
      }
      
      return res.json({ status: 'new', user: newUser });
    } else {
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
      
      // Send sign-in email notification for returning user
      try {
        await sendSignInEmail({
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          plant: updatedUser.plant,
          email: updatedUser.email,
          phone: updatedUser.phone,
          meetingWith: updatedUser.meetingWith || undefined,
          createdAt: updatedUser.createdAt,
        });
        console.log(`Sign-in email sent for returning user ${firstName} ${lastName}`);
      } catch (emailError) {
        console.error('Failed to send sign-in email:', emailError);
      }
      
      return res.json({ status: 'existing', user: updatedUser });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
});

//  Get currently signed-in users
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { signedOutAt: null },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching users' });
  }
});

// Sign out by ID (admin panel use)
app.post('/api/signout/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ message: 'Invalid user ID' });
  
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const updated = await prisma.user.update({
      where: { id },
      data: { signedOutAt: new Date() },
    });
    
    // Send sign-out email notification
    try {
      await sendSignOutEmail({
        firstName: user.firstName,
        lastName: user.lastName,
        plant: user.plant,
        email: user.email,
        phone: user.phone,
        meetingWith: user.meetingWith || undefined,
        createdAt: user.createdAt,
      });
      console.log(`Sign-out email sent for ${user.firstName} ${user.lastName}`);
    } catch (emailError) {
      console.error('Failed to send sign-out email:', emailError);
    }
    
    res.json({ message: 'Signed out successfully', user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during sign-out' });
  }
});

//  Sign out by name (SignOut page use)
app.post('/api/signout-by-name', async (req: Request, res: Response) => {
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
    
    // Send sign-out email notification
    try {
      await sendSignOutEmail({
        firstName: user.firstName,
        lastName: user.lastName,
        plant: user.plant,
        email: user.email,
        phone: user.phone,
        meetingWith: user.meetingWith || undefined,
        createdAt: user.createdAt,
      });
      console.log(`Sign-out email sent for ${user.firstName} ${user.lastName}`);
    } catch (emailError) {
      console.error('Failed to send sign-out email:', emailError);
    }
    
    res.json({ message: 'Signed out successfully', user: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manual endpoint to check for users past 5:30 PM and send notifications
app.post('/api/check-overtime', async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const centralTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Chicago"}));
    const hour = centralTime.getHours();
    const minute = centralTime.getMinutes();
    
    // Only run after 5:30 PM Central
    if (hour < 17 || (hour === 17 && minute < 30)) {
      return res.json({ message: 'Not yet 5:30 PM Central time' });
    }
    
    // Get users who are still signed in
    const signedInUsers = await prisma.user.findMany({
      where: { signedOutAt: null },
    });
    
    let emailsSent = 0;
    
    for (const user of signedInUsers) {
      try {
        await sendOvertimeNotification({
          firstName: user.firstName,
          lastName: user.lastName,
          plant: user.plant,
          email: user.email,
          phone: user.phone,
          meetingWith: user.meetingWith || undefined,
          createdAt: user.createdAt,
        });
        emailsSent++;
        console.log(`Overtime notification sent for ${user.firstName} ${user.lastName}`);
      } catch (emailError) {
        console.error(`Failed to send overtime notification for ${user.firstName} ${user.lastName}:`, emailError);
      }
    }
    
    res.json({ 
      message: `Overtime check completed. ${emailsSent} notifications sent.`,
      usersFound: signedInUsers.length,
      emailsSent 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error checking overtime users' });
  }
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});