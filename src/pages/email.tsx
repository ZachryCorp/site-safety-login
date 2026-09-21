//ok this is where im going to add my email portion service, im gonna want it running in the background and send when a user is signing in, signingout, and when theycomplete training, forward that certificate along with the rest

// Placeholder only - nothing implemented here yet. The sending itself now lives
// in the backend (backend/src/emailService.ts + graphMailer.ts), which is where
// it belongs: the Graph credentials must not reach the browser.
//
// tsconfig sets isolatedModules, so every file under src/ has to be a module.
// Without the export below this file is a global script and `react-scripts
// build` fails with TS1208, which breaks the Static Web Apps deploy.
export {};
