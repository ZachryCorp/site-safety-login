// backend/src/server.ts - Complete file with all features including email

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { sendSignInEmail, sendSignOutEmail } from './emailService';
//import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Backend is running!' });
});

// Create or update user (handles initial sign-in and re-login)
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, plant, email, phone, meetingWith } = req.body;
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      // User exists - update their info and clear sign-out time (re-login)
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          firstName,
          lastName,
          plant,
          phone,
          meetingWith,
          signedOutAt: null, // Clear the sign-out time to indicate they're signed in again
          updatedAt: new Date()
        }
      });
      
      // Send email notification if meeting with someone
      if (meetingWith) {
        try {
          await sendSignInEmail({
            firstName,
            lastName,
            plant,
            email,
            phone,
            meetingWith,
            createdAt: new Date()
          });
          console.log(`Sign-in email sent for ${firstName} ${lastName} meeting with ${meetingWith}`);
        } catch (emailError) {
          console.error('Failed to send sign-in email:', emailError);
          // Don't fail the request if email fails
        }
      }
      
      res.json({ 
        message: 'User signed in successfully', 
        user: updatedUser,
        isReturning: true,
        trainingCompleted: updatedUser.trainingCompleted 
      });
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          firstName,
          lastName,
          plant,
          email,
          phone,
          meetingWith,
          trainingCompleted: false,
          signedOutAt: null
        }
      });
      
      // Send email notification if meeting with someone
      if (meetingWith) {
        try {
          await sendSignInEmail({
            firstName,
            lastName,
            plant,
            email,
            phone,
            meetingWith,
            createdAt: new Date()
          });
          console.log(`Sign-in email sent for ${firstName} ${lastName} meeting with ${meetingWith}`);
        } catch (emailError) {
          console.error('Failed to send sign-in email:', emailError);
          // Don't fail the request if email fails
        }
      }
      
      res.json({ 
        message: 'User created successfully', 
        user: newUser,
        isReturning: false,
        trainingCompleted: false
      });
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ error: 'Failed to process user' });
  }
});

// Get all users
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Check if user exists and get their info
app.get('/api/check-user', async (req: Request, res: Response) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: email as string }
    });
    
    if (user) {
      res.json({ 
        exists: true, 
        trainingCompleted: user.trainingCompleted,
        isSignedOut: user.signedOutAt !== null,
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          plant: user.plant,
          phone: user.phone,
          meetingWith: user.meetingWith
        }
      });
    } else {
      res.json({ 
        exists: false, 
        trainingCompleted: false 
      });
    }
  } catch (error) {
    console.error('Error checking user:', error);
    res.status(500).json({ error: 'Failed to check user' });
  }
});

// Mark training as completed
app.post('/api/complete-training', async (req: Request, res: Response) => {
  try {
    const { email, quizScore, totalQuestions, answers } = req.body;
    
    const user = await prisma.user.update({
      where: { email },
      data: { 
        trainingCompleted: true,
        trainingDate: new Date()
      }
    });

    // Generate PDF certificate if you have PDFKit installed
    // const pdfBuffer = await generateSiteSpecificCertificate(user);
    // await prisma.user.update({
    //   where: { email },
    //   data: { trainingCertificatePDF: pdfBuffer }
    // });

    res.json({ 
      success: true,
      message: 'Training completed successfully'
    });
  } catch (error) {
    console.error('Error completing training:', error);
    res.status(500).json({ error: 'Failed to complete training' });
  }
});

// Sign out user
app.post('/api/sign-out', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    // Get user details before signing out
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update sign-out time
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        signedOutAt: new Date()
      }
    });
    
    // Send email notification if they were meeting with someone
    if (user.meetingWith) {
      try {
        await sendSignOutEmail({
          firstName: user.firstName,
          lastName: user.lastName,
          plant: user.plant,
          email: user.email,
          phone: user.phone,
          meetingWith: user.meetingWith,
          createdAt: user.createdAt
        });
        console.log(`Sign-out email sent for ${user.firstName} ${user.lastName}`);
      } catch (emailError) {
        console.error('Failed to send sign-out email:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    res.json({ 
      success: true, 
      message: 'User signed out successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error signing out user:', error);
    res.status(500).json({ error: 'Failed to sign out user' });
  }
});

// Get users who completed training
app.get('/api/trained-users', async (req: Request, res: Response) => {
  try {
    const trainedUsers = await prisma.user.findMany({
      where: {
        trainingCompleted: true
      },
      orderBy: {
        trainingDate: 'desc'
      }
    });
    
    res.json(trainedUsers);
  } catch (error) {
    console.error('Error fetching trained users:', error);
    res.status(500).json({ error: 'Failed to fetch trained users' });
  }
});

// Get currently signed-in users
app.get('/api/users/signed-in', async (req: Request, res: Response) => {
  try {
    const signedInUsers = await prisma.user.findMany({
      where: {
        signedOutAt: null
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });
    
    res.json(signedInUsers);
  } catch (error) {
    console.error('Error fetching signed-in users:', error);
    res.status(500).json({ error: 'Failed to fetch signed-in users' });
  }
});

// PDF Generation function (commented out until PDFKit is installed)
/*
async function generateSiteSpecificCertificate(user: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margin: 0,
        info: {
          Title: 'Site Specific Certificate',
          Author: 'Capitol Aggregates',
          Subject: 'Safety Training Certificate'
        }
      });

      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Blue header section
      const blueHeader = '#2874A6';
      doc.rect(0, 0, 612, 150)
         .fill(blueHeader);
      
      // Header text
      doc.fillColor('white')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('Site Specific Certificate', 0, 40, { align: 'center' });
      
      doc.fontSize(14)
         .font('Helvetica')
         .text('Complies with 30 CFR § 46.11', 0, 75, { align: 'center' });
      
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .text('Capitol Aggregates', 0, 105, { align: 'center' });
      
      doc.fontSize(16)
         .font('Helvetica')
         .text('Capitol Cement', 0, 130, { align: 'center' });
      
      // Certificate content
      const leftColumn = 100;
      const rightColumn = 320;
      let currentY = 200;
      const lineHeight = 35;
      
      const addRow = (label: string, value: string) => {
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .fillColor('#2C3E50')
           .text(label, leftColumn, currentY, { width: 200 });
        
        doc.fontSize(12)
           .font('Helvetica')
           .text(value, rightColumn, currentY, { width: 200 });
        
        currentY += lineHeight;
      };
      
      // Add certificate data
      addRow('First Name', user.firstName);
      addRow('Last Name', user.lastName);
      addRow('Company', user.meetingWith || 'N/A');
      addRow('Training Date', new Date(user.trainingDate || user.createdAt).toLocaleDateString());
      
      // Calculate expiration date (1 year from training)
      const trainingDate = new Date(user.trainingDate || user.createdAt);
      const expirationDate = new Date(trainingDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      addRow('Expiration Date', expirationDate.toLocaleDateString());
      
      addRow('Site Contact', 'James Davis');
      addRow('Training Video Link', 'youtube.com');
      addRow('Language', 'English');
      
      // Footer
      doc.fontSize(8)
         .fillColor('#95A5A6')
         .text('This certificate is valid for one year from the training date.', 50, 720, {
           align: 'center',
           width: 512
         });
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// Download certificate endpoint
app.get('/api/download-certificate/:email', async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.trainingCertificatePDF) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const fileName = `Site-Specific-Certificate-${user.firstName}-${user.lastName}-${user.id}.pdf`;
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Length': user.trainingCertificatePDF.length.toString()
    });

    res.send(user.trainingCertificatePDF);
  } catch (error) {
    console.error('Error downloading certificate:', error);
    res.status(500).json({ error: 'Failed to download certificate' });
  }
});
*/

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/test`);
});

// Cleanup on exit
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit();
});