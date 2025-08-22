import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  host: 'smtp-mail.outlook.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // Your Outlook email
    pass: process.env.EMAIL_PASS, // Your Outlook password or app password
  },
});

// Email address mapping for staff members
const staffEmails: { [key: string]: string } = {
  'Adam Ybarra': 'adam.ybarra@zachrycorp.com',
  'Jacob Ackerman': 'jacob.ackerman@zachrycorp.com',
  'William Aiken': 'william.aiken@zachrycorp.com',
  'Robert Alvarado': 'robert.alvarado@zachrycorp.com',
  'Julio Avila': 'julio.avila@zachrycorp.com',
  'Benjamin Caccamo': 'benjamin.caccamo@zachrycorp.com',
  'Michael Castillo': 'michael.castillo@zachrycorp.com',
  'Jose Cedeno': 'jose.cedeno@zachrycorp.com',
  'Diane Christensen': 'diane.christensen@zachrycorp.com',
  'Daniel Davis': 'daniel.davis@zachrycorp.com',
  'James Davis': 'james.davis@zachrycorp.com',
  'Eric Ervin': 'eric.ervin@zachrycorp.com',
  'Jesse Gallegos': 'jesse.gallegos@zachrycorp.com',
  'Keith Gilson': 'keith.gilson@zachrycorp.com',
  'Jose Gonzalez': 'jose.gonzalez@zachrycorp.com',
  'Craig Hernandez': 'craig.hernandez@zachrycorp.com',
  'Joseph Hernandez': 'joseph.hernandez@zachrycorp.com',
  'Richard Jarzombek': 'richard.jarzombek@zachrycorp.com',
  'Erik Kottke': 'erik.kottke@zachrycorp.com',
  'Mario Lira': 'mario.lira@zachrycorp.com',
  'Zachary McMahon': 'zachary.mcmahon@zachrycorp.com',
  'Raul Molina': 'raul.molina@zachrycorp.com',
  'Ramon Riviera': 'ramon.riviera@zachrycorp.com',
  'Jason Stehle': 'jason.stehle@zachrycorp.com',
  'Derek E. Thorington': 'derek.thorington@zachrycorp.com',
  'Jagger Tieman': 'jagger.tieman@zachrycorp.com',
  'Arnie Tovar': 'arnie.tovar@zachrycorp.com',
  'Mason Vanderweele': 'mason.vanderweele@zachrycorp.com',
  'Tony Ward': 'tony.ward@zachrycorp.com',
  'Mike Watson': 'mike.watson@zachrycorp.com',
  'Hernan Williams': 'hernan.williams@zachrycorp.com',
  'Scott Wolston': 'scott.wolston@zachrycorp.com',
  'Robert Allison': 'robert.allison@zachrycorp.com'
};

export interface User {
  firstName: string;
  lastName: string;
  plant: string;
  email: string;
  phone: string;
  meetingWith?: string;
  createdAt: Date;
}

export async function sendSignInEmail(user: User): Promise<void> {
  if (!user.meetingWith || !staffEmails[user.meetingWith]) {
    return; // No meeting contact or email not found
  }

  const recipientEmail = staffEmails[user.meetingWith];
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Visitor Sign-In: ${user.firstName} ${user.lastName}`,
    html: `
      <h3>Visitor Sign-In Notification</h3>
      <p>A visitor has signed in to meet with you:</p>
      <ul>
        <li><strong>Name:</strong> ${user.firstName} ${user.lastName}</li>
        <li><strong>Plant:</strong> ${user.plant}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Phone:</strong> ${user.phone}</li>
        <li><strong>Sign-in Time:</strong> ${user.createdAt.toLocaleString('en-US', { timeZone: 'America/Chicago' })}</li>
      </ul>
      <p>Please be aware that your visitor has arrived.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendSignOutEmail(user: User): Promise<void> {
  if (!user.meetingWith || !staffEmails[user.meetingWith]) {
    return;
  }

  const recipientEmail = staffEmails[user.meetingWith];
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Visitor Sign-Out: ${user.firstName} ${user.lastName}`,
    html: `
      <h3>Visitor Sign-Out Notification</h3>
      <p>Your visitor has signed out:</p>
      <ul>
        <li><strong>Name:</strong> ${user.firstName} ${user.lastName}</li>
        <li><strong>Plant:</strong> ${user.plant}</li>
        <li><strong>Sign-out Time:</strong> ${new Date().toLocaleString('en-US', { timeZone: 'America/Chicago' })}</li>
      </ul>
    `,
  };

  await transporter.sendMail(mailOptions);
}

export async function sendOvertimeNotification(user: User): Promise<void> {
  if (!user.meetingWith || !staffEmails[user.meetingWith]) {
    return;
  }

  const recipientEmail = staffEmails[user.meetingWith];
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: `Late Visitor Alert: ${user.firstName} ${user.lastName}`,
    html: `
      <h3>Late Visitor Alert</h3>
      <p>Your visitor is still on-site past 5:30 PM Central:</p>
      <ul>
        <li><strong>Name:</strong> ${user.firstName} ${user.lastName}</li>
        <li><strong>Plant:</strong> ${user.plant}</li>
        <li><strong>Email:</strong> ${user.email}</li>
        <li><strong>Phone:</strong> ${user.phone}</li>
        <li><strong>Sign-in Time:</strong> ${user.createdAt.toLocaleString('en-US', { timeZone: 'America/Chicago' })}</li>
      </ul>
      <p>Please check if they need to sign out or extend their visit.</p>
    `,
  };

  await transporter.sendMail(mailOptions);
}