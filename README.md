# Pacman - Trimble Edition

A unique browser-based Pacman game where you collect Trimble logos instead of pellets! Built with Spring Boot and JavaScript.

## Features

- Classic Pacman gameplay with a Trimble twist
- Collect Trimble logos instead of pellets
- Arrow key controls
- Score tracking
- Lives system
- Power Trimble logos that allow Pacman to eat ghosts
- Simple ghost AI
- Responsive design

## Requirements

- Java 8 or higher
- Maven 3.6 or higher

## How to Run

1. Navigate to the project directory:
   ```bash
   cd pacman
   ```

2. Build the project:
   ```bash
   mvn clean install
   ```

3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

4. Open your web browser and go to:
   ```
   http://localhost:8081
   ```

## How to Play

- Use **Arrow Keys** to move Pacman
- Collect all Trimble logos to win
- Avoid ghosts (unless you've collected a power Trimble logo)
- Power Trimble logos (larger logos) allow you to eat ghosts for bonus points
- You have 3 lives

## Scoring

- Regular Trimble logo: 10 points
- Power Trimble logo: 50 points
- Eating a ghost: 200 points

## Game Controls

- **Start Game**: Click the "Start Game" button
- **Pause**: Click the "Pause" button during gameplay
- **Reset**: Click the "Reset" button to restart

## Technology Stack

- Backend: Java 8, Spring Boot 2.7.14
- Frontend: HTML5 Canvas, JavaScript, CSS
- Build Tool: Maven 