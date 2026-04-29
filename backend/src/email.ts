// backend/src/emailService.ts - Email service using Outlook/Office365

import nodemailer from 'nodemailer';


// Function to generate email from name
function generateEmail(fullName: string): string {
  // Remove title if present 
  const namePart = fullName.split(' - ')[0].trim();
  
  // Split into parts and handle names with middle initials or multiple parts
  const parts = namePart.toLowerCase().split(' ');
  
  if (parts.length >= 2) {
    // Take first name and last name (ignore middle names/initials)
    const firstName = parts[0];
    const lastName = parts[parts.length - 1];
    return `${firstName}.${lastName}@zachrycorp.com`;
  }
  
  // Fallback for single names
  return `${parts[0]}@zachrycorp.com`;
}

// Create transporter for Outlook/Office365
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.office365.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'robert.allison@zachrycorp.com',
      pass: process.env.EMAIL_PASSWORD || 'Richie44!Daisy44!'
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: false // Set to true in production with valid certificates
    }
  });
};

// Send notification when visitor signs in
export async function sendSignInNotification(
  visitorData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    plant: string;
    meetingWith: string;
  }
) {
  try {
    if (!visitorData.meetingWith) {
      console.log('No meeting person specified, skipping email');
      return { success: false, message: 'No meeting person specified' };
    }

    // Generate recipient email from the meeting person's name
    const recipientEmail = generateEmail(visitorData.meetingWith);
    
    console.log(`Sending sign-in notification to: ${recipientEmail}`);

    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'robert.allison@zachrycorp.com',
      to: recipientEmail,
      cc: 'robert.allison@zachrycorp.com', 
      subject: `Visitor Arrival: ${visitorData.firstName} ${visitorData.lastName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #0078d4; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f8f9fa; }
            .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; }
            .info-table td { padding: 12px; border-bottom: 1px solid #dee2e6; }
            .info-table td:first-child { font-weight: bold; width: 40%; background-color: #f8f9fa; }
            .alert { margin-top: 20px; padding: 15px; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; }
            .footer { background-color: #6c757d; color: white; padding: 10px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">🔔 Visitor Notification</h2>
              <p style="margin: 5px 0 0 0;">Site Safety System</p>
            </div>
            
            <div class="content">
              <h3 style="color: #333;">A visitor has arrived to meet with you</h3>
              
              <table class="info-table">
                <tr>
                  <td>Visitor Name:</td>
                  <td>${visitorData.firstName} ${visitorData.lastName}</td>
                </tr>
                <tr>
                  <td>Email:</td>
                  <td><a href="mailto:${visitorData.email}" style="color: #0078d4;">${visitorData.email}</a></td>
                </tr>
                <tr>
                  <td>Phone:</td>
                  <td><a href="tel:${visitorData.phone}" style="color: #0078d4;">${visitorData.phone}</a></td>
                </tr>
                <tr>
                  <td>Plant Location:</td>
                  <td>${visitorData.plant}</td>
                </tr>
                <tr>
                  <td>Sign-in Time:</td>
                  <td>${new Date().toLocaleString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
              </table>
              
              <div class="alert">
                <strong>📍 Action Required:</strong> Please proceed to the reception area to meet your visitor.
              </div>
            </div>
            
            <div class="footer">
              Automated message from Zachrycorp Site Safety System
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Sign-in notification sent successfully to ${recipientEmail}`);
    return { success: true, message: 'Notification sent successfully' };
    
  } catch (error) {
    console.error('Error sending sign-in notification:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Send notification when visitor signs out
export async function sendSignOutNotification(
  visitorData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    plant: string;
    meetingWith: string;
    signInTime: Date;
    signOutTime: Date;
  }
) {
  try {
    if (!visitorData.meetingWith) {
      console.log('No meeting person specified, skipping email');
      return { success: false, message: 'No meeting person specified' };
    }

    // Generate recipient email from the meeting person's name
    const recipientEmail = generateEmail(visitorData.meetingWith);
    
    console.log(`Sending sign-out notification to: ${recipientEmail}`);

    const transporter = createTransporter();
    
    // Calculate visit duration
    const duration = Math.round((visitorData.signOutTime.getTime() - visitorData.signInTime.getTime()) / 1000 / 60); // in minutes
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    const durationString = hours > 0 ? `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''}` : `${minutes} minute${minutes !== 1 ? 's' : ''}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || 'robert.allison@zachrycorp.com',
      to: recipientEmail,
      cc: 'robert.allison@zachrycorp.com', // CC to admin for tracking
      subject: `Visitor Departure: ${visitorData.firstName} ${visitorData.lastName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; }
            .header { background-color: #d83b3b; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f8f9fa; }
            .info-table { width: 100%; border-collapse: collapse; margin-top: 20px; background: white; }
            .info-table td { padding: 12px; border-bottom: 1px solid #dee2e6; }
            .info-table td:first-child { font-weight: bold; width: 40%; background-color: #f8f9fa; }
            .alert { margin-top: 20px; padding: 15px; background-color: #f8d7da; border: 1px solid #f5c6cb; border-radius: 5px; }
            .footer { background-color: #6c757d; color: white; padding: 10px; text-align: center; font-size: 12px; }
            .duration { color: #0078d4; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">👋 Visitor Sign-Out Notification</h2>
              <p style="margin: 5px 0 0 0;">Site Safety System</p>
            </div>
            
            <div class="content">
              <h3 style="color: #333;">Your visitor has signed out</h3>
              
              <table class="info-table">
                <tr>
                  <td>Visitor Name:</td>
                  <td>${visitorData.firstName} ${visitorData.lastName}</td>
                </tr>
                <tr>
                  <td>Sign-in Time:</td>
                  <td>${visitorData.signInTime.toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
                <tr>
                  <td>Sign-out Time:</td>
                  <td>${visitorData.signOutTime.toLocaleString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</td>
                </tr>
                <tr>
                  <td>Visit Duration:</td>
                  <td class="duration">${durationString}</td>
                </tr>
                <tr>
                  <td>Plant Location:</td>
                  <td>${visitorData.plant}</td>
                </tr>
              </table>
              
              <div class="alert">
                <strong>ℹ️ Information:</strong> This visitor has left the premises.
              </div>
            </div>
            
            <div class="footer">
              Automated message from Zachrycorp Site Safety System
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Sign-out notification sent successfully to ${recipientEmail}`);
    return { success: true, message: 'Sign-out notification sent successfully' };
    
  } catch (error) {
    console.error('Error sending sign-out notification:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Test email connection
export async function testEmailConnection() {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('Email server connection successful');
    return true;
  } catch (error) {
    console.error('Email server connection failed:', error);
    return false;
  }
}

// Export the functions
export default {
  sendSignInNotification,
  sendSignOutNotification,
  testEmailConnection,
  generateEmail
};