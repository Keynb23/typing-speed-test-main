Frontend Mentor - Typing Speed Test (AI Enhanced)
Welcome! 👋
This is a modified version of the Frontend Mentor Typing Speed Test challenge. While the core focus is on frontend responsive design, this version integrates a Machine Learning backend to predict user performance.

The AI Enhancement 🤖
Unlike the standard challenge, this project features a Python Flask server and a Linear Regression model.

Learning from History: The app tracks your typing patterns based on your username.

Performance Forecasting: Before you start a new quote, the AI analyzes the character distribution (count of 'a', 'b', 'c', etc.) and predicts your WPM and Accuracy based on your historical data.

Dynamic Training: Every completed test is sent to the backend to refine the model's accuracy for your specific typing style.

The Challenge
The goal was to build a highly responsive typing test app that feels fluid while handling real-time data communication with a local server.

User Features
Personalized Sessions: Enter a username to load your specific AI model.

ML Forecast: See "AI Forecast" metrics before you even start typing.

Difficulty Selection: Choose between Easy, Medium, and Hard passages from data.json.

Live Stats: Real-time calculation of WPM, Accuracy, and Score.

No-Reload Experience: The app uses asynchronous fetch requests and a manual Submit/Restart flow to ensure the page never refreshes, preserving your session state.

Typing Experience
Visual Feedback: Correct characters turn green; errors are highlighted in red and underlined.

Hard Mode Constraint: Backspace is disabled to encourage flow and provide the ML model with "raw" typing data.

Submit System: A dedicated Submit button handles the data finalization to prevent accidental form reloads.

Technical Stack
Frontend
HTML5/CSS3: Custom properties for light/dark mode support.

Vanilla JavaScript: DOM manipulation, real-time string comparison, and Async/Await fetch API.

Backend (The ML Core)
Python / Flask: Handles the API endpoints for /predict and /train.

Scikit-Learn: Utilizes LinearRegression to map character distributions to typing speeds.

JSON Storage: User data is persisted in local JSON files organized by username.

Expected Behaviors
Starting the test: Select a difficulty and click "New Quote". The AI will generate a prediction immediately.

Baseline Requirement: The AI requires 3 completed tests per username to establish enough data to generate a valid trend line. Until then, the badge will display "Wait...".

Data Persistence: User history is stored in the /UserDataHistory folder. Deleting a user's JSON file resets their AI model.

Manual Reset: The "Restart" button clears the current UI state and resets stats without refreshing the browser, allowing for fast, repetitive training sessions.

How to Run Locally
Start the Backend:

Bash

python app.py
Ensure you have flask, flask-cors, and sklearn installed.

Launch the Frontend: Open index.html in any modern browser (using Live Server is recommended).

Establish a Connection: Ensure the frontend is fetching from http://127.0.0.1:5000.

Building & Learnings
Building this project helped me understand:

How to prevent default browser behaviors (like form submission reloads) in complex UIs.

How to format features for a Machine Learning model (Character Frequency Distribution).

The importance of data consistency when sending objects between a JavaScript frontend and a Python backend.

Have fun typing! 🚀
