import { exec } from 'node:child_process';
import { promises as fs } from 'node:fs';
import { promisify } from 'node:util';
import readline from 'node:readline';
import crypto from 'node:crypto';
import path from 'node:path';
import os from 'node:os';

const execAsync = promisify(exec);

function question(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function checkStripeCLI() {
  console.log(
    'Step 1: Checking if Stripe CLI is installed and authenticated...'
  );
  try {
    await execAsync('stripe --version');
    console.log('Stripe CLI is installed.');

    // Check if Stripe CLI is authenticated
    try {
      await execAsync('stripe config --list');
      console.log('Stripe CLI is authenticated.');
    } catch (error) {
      console.log(
        'Stripe CLI is not authenticated or the authentication has expired.'
      );
      console.log('Please run: stripe login');
      const answer = await question(
        'Have you completed the authentication? (y/n): '
      );
      if (answer.toLowerCase() !== 'y') {
        console.log(
          'Please authenticate with Stripe CLI and run this script again.'
        );
        process.exit(1);
      }

      // Verify authentication after user confirms login
      try {
        await execAsync('stripe config --list');
        console.log('Stripe CLI authentication confirmed.');
      } catch (error) {
        console.error(
          'Failed to verify Stripe CLI authentication. Please try again.'
        );
        process.exit(1);
      }
    }
  } catch (error) {
    console.error(
      'Stripe CLI is not installed. Please install it and try again.'
    );
    console.log('To install Stripe CLI, follow these steps:');
    console.log('1. Visit: https://docs.stripe.com/stripe-cli');
    console.log(
      '2. Download and install the Stripe CLI for your operating system'
    );
    console.log('3. After installation, run: stripe login');
    console.log(
      'After installation and authentication, please run this setup script again.'
    );
    process.exit(1);
  }
}

async function getFirebaseCredentials() {
  console.log('Step 2: Setting up Firebase');
  console.log(
    'You can find your Firebase credentials at: https://console.firebase.google.com/'
  );
  console.log(
    '1. Go to Project Settings > General > Your apps'
  );
  console.log(
    '2. If you haven\'t created a web app, click "Add app" and select Web'
  );
  console.log(
    '3. Copy the configuration values'
  );
  console.log('');

  const apiKey = await question('Enter your FIREBASE_API_KEY: ');
  const authDomain = await question('Enter your FIREBASE_AUTH_DOMAIN: ');
  const projectId = await question('Enter your FIREBASE_PROJECT_ID: ');

  console.log('');
  console.log('Step 3: Setting up Firebase Admin SDK');
  console.log(
    'You need to generate a service account key for Firebase Admin:'
  );
  console.log(
    '1. Go to Project Settings > Service Accounts'
  );
  console.log(
    '2. Click "Generate new private key"'
  );
  console.log(
    '3. Copy the values from the JSON file'
  );
  console.log('');

  const adminProjectId = await question('Enter your FIREBASE_ADMIN_PROJECT_ID: ');
  const adminClientEmail = await question('Enter your FIREBASE_ADMIN_CLIENT_EMAIL: ');
  const adminPrivateKey = await question(
    'Enter your FIREBASE_ADMIN_PRIVATE_KEY (the full key from the JSON file): '
  );

  return {
    apiKey,
    authDomain,
    projectId,
    adminProjectId,
    adminClientEmail,
    adminPrivateKey,
  };
}

async function getStripeSecretKey(): Promise<string> {
  console.log('Step 4: Getting Stripe Secret Key');
  console.log(
    'You can find your Stripe Secret Key at: https://dashboard.stripe.com/test/apikeys'
  );
  return await question('Enter your Stripe Secret Key: ');
}

async function createStripeWebhook(): Promise<string> {
  console.log('Step 5: Creating Stripe webhook...');
  try {
    const { stdout } = await execAsync('stripe listen --print-secret');
    const match = stdout.match(/whsec_[a-zA-Z0-9]+/);
    if (!match) {
      throw new Error('Failed to extract Stripe webhook secret');
    }
    console.log('Stripe webhook created.');
    return match[0];
  } catch (error) {
    console.error(
      'Failed to create Stripe webhook. Check your Stripe CLI installation and permissions.'
    );
    if (os.platform() === 'win32') {
      console.log(
        'Note: On Windows, you may need to run this script as an administrator.'
      );
    }
    throw error;
  }
}

async function writeEnvFile(envVars: Record<string, string>) {
  console.log('Step 6: Writing environment variables to .env');
  const envContent = Object.entries(envVars)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  await fs.writeFile(path.join(process.cwd(), '.env'), envContent);
  console.log('.env file created with the necessary variables.');
}

async function main() {
  await checkStripeCLI();

  const {
    apiKey,
    authDomain,
    projectId,
    adminProjectId,
    adminClientEmail,
    adminPrivateKey,
  } = await getFirebaseCredentials();

  const STRIPE_SECRET_KEY = await getStripeSecretKey();
  const STRIPE_WEBHOOK_SECRET = await createStripeWebhook();
  const BASE_URL = 'http://localhost:3000';

  await writeEnvFile({
    FIREBASE_API_KEY: apiKey,
    FIREBASE_AUTH_DOMAIN: authDomain,
    FIREBASE_PROJECT_ID: projectId,
    FIREBASE_ADMIN_PROJECT_ID: adminProjectId,
    FIREBASE_ADMIN_CLIENT_EMAIL: adminClientEmail,
    FIREBASE_ADMIN_PRIVATE_KEY: adminPrivateKey.replace(/\\n/g, '\n'),
    STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET,
    BASE_URL,
  });

  console.log('🎉 Setup completed successfully!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Make sure Firebase Authentication is enabled in your Firebase project');
  console.log('2. Enable Email/Password authentication in Firebase Console');
  console.log('3. Run `pnpm install` to install dependencies');
  console.log('4. Run `pnpm dev` to start the development server');
}

main().catch(console.error);
