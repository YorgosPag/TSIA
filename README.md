# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

---

## How to Deploy Your App to the Internet

To publish your application online, you can use **Firebase Hosting**. You will need to use the Firebase Command Line Interface (CLI) from your computer's terminal.

### Step 1: Install the Firebase CLI

If you don't have it installed, open your terminal and run this command:
```bash
npm install -g firebase-tools
```

### Step 2: Log in to Firebase

Run this command to log in with your Google account. A browser window will open for you to sign in.
```bash
firebase login
```

### Step 3: Initialize Firebase in Your Project

Navigate to your project's root folder in the terminal and run this command. It will link your local code to your Firebase project.
```bash
firebase init hosting
```
When prompted, select the Firebase project you've been using. When it asks for your public directory, just press Enter to accept the default. When it asks "Configure as a single-page app?", type 'y' and press Enter.

### Step 4: Deploy Your Application

This is the final step! Run the following command. The CLI will build your app and upload it to Firebase's servers.
```bash
firebase deploy --only hosting
```

After the command finishes, it will give you a unique URL (e.g., `https://your-app-name.web.app`). This is the live link to your application on the internet!
