# TypeBlaze  

**TypeBlaze** is a competitive multiplayer typing game that tests your typing speed and accuracy. Compete in real-time and climb the leaderboard to become the fastest typist!  

## Table of Contents  

- [Features](#features)  
- [Getting Started](#getting-started)  
- [Installation](#installation)  
- [How to Play](#how-to-play)  
- [Contributing](#contributing)  
- [Technologies Used](#technologies-used)  
- [Deployment](#deployment)  

## Features  

- **Real-Time Multiplayer**: Compete against other players in real-time typing matches.  
- **Live Scoreboard**: Track your ranking and progress during live games.  
- **Typing Speed & Accuracy**: Monitor Words Per Minute (WPM) and accuracy stats.  
- **Leaderboard**: Compare scores with players worldwide.  
- **Custom Game Rooms**: Create personalized rooms with custom settings.  
- **Authentication**: Sign up, log in, log out, and password reset (planned).  
- **Mobile & Desktop Friendly**: Fully responsive UI for all devices.  

## Upcoming Features  

- **Profile Page**: Track match history and stats.  
- **Leaderboard Page**: View the top players and their statistics.  
- **Settings Page**: Customize game settings.  
- **Achievements & Rewards**: Unlock achievements to engage users.  
- **Friends & Chat**: Add friends and chat with them.  
- **Notifications**: Stay updated with in-game events.  
- **Shop**: Purchase premium features (TBD).  

## Getting Started  

Follow these steps to set up TypeBlaze on your local machine.  

### Prerequisites  

Ensure you have the following installed:  

- [Node.js](https://nodejs.org/) (v20 or newer)  
- [npm](https://www.npmjs.com/) (or Yarn, pnpm, or bun)  
- Git (for cloning the repository)  

### Installation  

1. Clone the repository:  

   ```bash
   git clone https://github.com/Nityanand17/typeblaze.git
   ```

2. Navigate to the project directory and install dependencies:  

   ```bash
   cd typeblaze
   npm install
   npm run dev
   ```  

3. Open your browser and go to `http://localhost:3000` to access the game.  

## How to Play  

1. **Join or Create a Room**: Enter an existing game or create a custom room.  
2. **Start Typing**: Type the given text as fast and accurately as possible.  
3. **Live Scoreboard**: Monitor your WPM and accuracy in real time.  
4. **Win the Game**: The fastest and most accurate typist wins!  

## Contributing  

Want to contribute? Follow these steps:  

1. Fork the repository.  
2. Create a new branch for your feature or fix:  

   ```bash
   git checkout -b feature/YourFeatureName
   ```  

3. Make changes and commit:  

   ```bash
   git commit -m "Add YourFeatureName"
   ```  

4. Push to the branch:  

   ```bash
   git push origin feature/YourFeatureName
   ```  

5. Open a pull request for review.  

## Technologies Used  

- **Next.js** - React-based framework for the frontend.  
- **Socket.io** - Enables real-time communication.  
- **Tailwind CSS** - Utility-first CSS for styling.  
- **React** - JavaScript library for UI components.  
- **Vercel** - Hosting and deployment platform.  

## Deployment  

- **Frontend**: Deployed on **Vercel**.  
- **Backend**: Uses **Express.js** and **Socket.io** (hosting options under consideration).  
- **Authentication**: Implemented using **Next.js API Routes** (`api/route.ts`).  
