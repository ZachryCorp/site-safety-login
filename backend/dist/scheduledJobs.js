"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startScheduledJobs = startScheduledJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const emailService_1 = require("./emailService");
const prisma = new client_1.PrismaClient();
function startScheduledJobs() {
    // Run every day at 5:30 PM Central Time
    // Cron expression: '30 17 * * *' = minute 30, hour 17 (5 PM), every day
    node_cron_1.default.schedule('30 17 * * *', async () => {
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
                    await (0, emailService_1.sendOvertimeNotification)({
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
                }
                catch (emailError) {
                    console.error(`Failed to send overtime notification for ${user.firstName} ${user.lastName}:`, emailError);
                }
            }
            console.log(`Overtime check completed. ${emailsSent} notifications sent.`);
        }
        catch (error) {
            console.error('Error during scheduled overtime check:', error);
        }
    }, {
        timezone: "America/Chicago" // Central Time
    });
    console.log('Scheduled job for 5:30 PM overtime check started');
}
