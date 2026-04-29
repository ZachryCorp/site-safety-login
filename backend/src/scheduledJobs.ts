import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendOvertimeNotification } from './emailService';

const prisma = new PrismaClient();

// Returns the UTC instant corresponding to today 00:00 in America/Chicago,
// handling CST/CDT correctly via the runtime's IANA tz database.
function startOfTodayCentralAsUtc(): Date {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parseInt(parts.find(p => p.type === t)!.value, 10);
  const y = get('year');
  const mo = get('month');
  const d = get('day');
  // Treat the Central wall-clock reading as if it were UTC, then derive offset.
  const centralWallAsUtc = Date.UTC(y, mo - 1, d, get('hour') % 24, get('minute'), get('second'));
  const offsetMs = now.getTime() - centralWallAsUtc;
  return new Date(Date.UTC(y, mo - 1, d, 0, 0, 0) + offsetMs);
}

// Catch-up routine: signs out anyone who is still signed in from a previous
// Central-Time day. Safe to call on every server startup.
export async function autoSignOutPreviousDays() {
  try {
    const cutoff = startOfTodayCentralAsUtc();
    const result = await prisma.user.updateMany({
      where: {
        signedOutAt: null,
        createdAt: { lt: cutoff },
      },
      data: { signedOutAt: cutoff },
    });
    console.log(`Startup catch-up: signed out ${result.count} users from previous days.`);
  } catch (error) {
    console.error('Error during startup auto sign-out catch-up:', error);
  }
}

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

  // Run every day at midnight Central Time to auto sign-out anyone still signed in
  cron.schedule('0 0 * * *', async () => {
    console.log('Running midnight auto sign-out...');

    try {
      const result = await prisma.user.updateMany({
        where: { signedOutAt: null },
        data: { signedOutAt: new Date() },
      });

      console.log(`Midnight auto sign-out completed. ${result.count} users signed out.`);
    } catch (error) {
      console.error('Error during midnight auto sign-out:', error);
    }
  }, {
    timezone: "America/Chicago" // Central Time
  });

  console.log('Scheduled job for 5:30 PM overtime check started');
  console.log('Scheduled job for midnight auto sign-out started');
}