# Sprinkler Automation Project

This project automates decisions and notifications for a smart sprinkler system using weather data, AI, and various APIs.

## Features

-   Fetches weather forecasts and device data from multiple sources (NWS, Ecowitt, RainMachine, etc.)
-   Uses Google AI to generate watering recommendations
-   Sends notifications via Pushbullet (and optionally SMS)

## Prerequisites

-   Node.js (v16 or newer recommended)
-   npm or yarn

## Setup

1. **Clone the repository:**

    ```sh
    git clone <your-repo-url>
    cd sprinkler
    ```

2. **Install dependencies:**

    ```sh
    npm install
    # or
    yarn install
    ```

3. **Environment Variables:**
   Create a `.env` file in the project root with the following variables:

    ```env
    ECOWITT_API_KEY=your_ecowitt_api_key
    ECOWITT_APPLICATION_KEY=your_ecowitt_application_key
    GOOGLE_API_KEY=your_google_api_key
    GOOGLE_MODEL=your_google_model
    PUSH_BULLET_API_KEY=your_pushbullet_api_key
    RAIN_MACHINE_PASSWORD=your_rainmachine_password
    ```

    > **Note:** All variables are required for the script to run. The app will throw an error if any are missing.

4. **Run the script:**
    ```sh
    npx ts-node sprinkler.ts
    # or compile and run with node
    tsc sprinkler.ts && node sprinkler.js
    ```

## How it Works

-   The script fetches weather and device data.
-   It generates a prompt for Google AI to decide on watering needs.
-   The AI's response is sent as a Pushbullet notification (and can be extended to SMS).

## Customization

-   You can extend the script to use other notification methods or integrate with additional APIs.
-   See `sprinkler.ts` for the main logic.

## Development

-   Environment variables are loaded using [dotenv](https://www.npmjs.com/package/dotenv).

## License

MIT
