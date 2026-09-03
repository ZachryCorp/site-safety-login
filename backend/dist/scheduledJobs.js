"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoSignOutPreviousDays = autoSignOutPreviousDays;
exports.startScheduledJobs = startScheduledJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const emailService_1 = require("./emailService");
const prisma = new client_1.PrismaClient();
// Returns the UTC instant corresponding to today 00:00 in America/Chicago,
// handling CST/CDT correctly via the runtime's IANA tz database.
function startOfTodayCentralAsUtc() {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Chicago',
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false,
    }).formatToParts(now);
    const get = (t) => parseInt(parts.find(p => p.type === t).value, 10);
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
async function autoSignOutPreviousDays() {
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
    }
    catch (error) {
        console.error('Error during startup auto sign-out catch-up:', error);
    }
}
function startScheduledJobs() {
    // Run every day at 5:00 PM Central Time
    // Cron expression: '0 17 * * *' = minute 0, hour 17 (5 PM), every day
    node_cron_1.default.schedule('0 17 * * *', async () => {
        console.log('Running 5:00 PM still-on-site check...');
        try {
            // Get users who are still signed in
            const signedInUsers = await prisma.user.findMany({
                where: { signedOutAt: null },
            });
            console.log(`Found ${signedInUsers.length} users still signed in at 5:00 PM`);
            for (const user of signedInUsers) {
                await (0, emailService_1.sendStillOnSiteEmail)(user);
            }
            console.log(`Still-on-site check completed for ${signedInUsers.length} users.`);
        }
        catch (error) {
            console.error('Error during scheduled still-on-site check:', error);
        }
    }, {
        timezone: "America/Chicago" // Central Time
    });
    // Run every day at midnight Central Time to auto sign-out anyone still signed in
    node_cron_1.default.schedule('0 0 * * *', async () => {
        console.log('Running midnight auto sign-out...');
        try {
            const result = await prisma.user.updateMany({
                where: { signedOutAt: null },
                data: { signedOutAt: new Date() },
            });
            console.log(`Midnight auto sign-out completed. ${result.count} users signed out.`);
        }
        catch (error) {
            console.error('Error during midnight auto sign-out:', error);
        }
    }, {
        timezone: "America/Chicago" // Central Time
    });
    console.log('Scheduled job for 5:00 PM still-on-site check started');
    console.log('Scheduled job for midnight auto sign-out started');
}
