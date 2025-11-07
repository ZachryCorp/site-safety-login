import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendOvertimeNotification } from './emailService';

const prisma = new PrismaClient();

export function startScheduledJobs() {
  // Run every day at 5:30 PM Central Time
  // Cron expression: '30 17 * * *' = minute 30, hour 17 (5 PM), every day
  cron.schedule('30 17 * * *', async () => {
    console.log('Running 5:30 PM overtime check...');
    
    try {
      // Get users who are still signed in
      const signedInUsers = await prisma.user.findMany({
        where: { signedOutAt: null },
      });
      
      console.log(`Found ${signedInUsers.length} users still signed in at 5:30 PM`);
      
      let emailsSent = 0;
      
      for (const user of signedInUsers) {
        try {
          await sendOvertimeNotification({
            firstName: user.firstName,
            lastName: user.lastName,
            plant: user.plant || '',
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
      
      console.log(`Overtime check completed. ${emailsSent} notifications sent.`);
    } catch (error) {
      console.error('Error during scheduled overtime check:', error);
    }
  }, {
    timezone: "America/Chicago" // Central Time
  });
  
  console.log('Scheduled job for 5:30 PM overtime check started');
}