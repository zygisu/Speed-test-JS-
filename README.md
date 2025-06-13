# Speed Typing Test

A web-based speed typing test that allows users to measure their typing speed and accuracy using either random quotes from an API or custom text loaded from a JSON file.

## Features

- Choose between random quotes (from [Quotable API](https://api.quotable.io/random)) or your own custom text (via JSON file).
- Timer-based typing test (default: 60 seconds).
- Real-time highlighting of correct and incorrect characters.
- Tracks and displays:
  - Words per minute (WPM)
  - Total mistakes
  - Accuracy (%)
  - Progress over time (history table)
  - Judgement (Better/Worse/Same compared to previous attempt)
- Keyboard shortcuts:
  - **Enter**: Restart test
  - **Escape**: Return to main menu
- Designed for desktop. Mobile version not implemented. 

## Getting Started

1. **Clone or Download the Repository**

2. **Open [V2/index.html](V2/index.html) in your browser**

   No build step is required. All logic is in JavaScript modules.

## Usage

1. **Choose Input Type**
   - Click **Choose random text** to use random quotes from the API.
   - Click **Input text via JSON file** to upload your own `.json` file.

2. **Start Typing**
   - Click **Start typing** to begin the test.
   - Type the displayed quote as accurately and quickly as possible.
   - New quotes will appear as you finish each one, until the timer runs out.

3. **View Results**
   - After time is up, your stats will be shown.
   - Click **Show Statistics** to view your progress over time.

4. **Restart or Return**
   - Use the **Restart Typing Test** button or press **Enter** to try again.
   - Use the **Return** button or press **Escape** to go back to the main menu.

## Custom Quotes (JSON Input)

You can provide your own set of quotes by uploading a JSON file.  
The file must contain an array of non-empty strings, for example:

```json
[
  "The quick brown fox jumps over the lazy dog.",
  "Practice makes perfect.",
  "Stay curious and keep learning new things!"
]
```

A sample file is provided at [V2/Mock Json inputs/quotes.json](V2/Mock%20Json%20inputs/quotes.json).

## File Structure

- [V2/index.html](V2/index.html): Main HTML file
- [V2/styles.css](V2/styles.css): Stylesheet
- [V2/JS code/main.js](V2/JS%20code/main.js): Entry point, module setup
- [V2/JS code/ui.js](V2/JS%20code/ui.js): UI overlay logic
- [V2/JS code/typing.js](V2/JS%20code/typing.js): Typing logic and event handling
- [V2/JS code/fileinput.js](V2/JS%20code/fileinput.js): JSON file input logic
- [V2/JS code/stats.js](V2/JS%20code/stats.js): Statistics and history logic
- [V2/Mock Json inputs/quotes.json](V2/Mock%20Json%20inputs/quotes.json): Example custom quotes file

## Important!  

- If you upload an invalid or empty JSON file, an error will be shown.
- The app uses local storage to save your typing history.
- If the API is unavailable, a fallback hardcoded quote will be used.
