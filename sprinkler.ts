import "dotenv/config";
import { generateWateringPrompt, GoogleAIClient } from "./ai";
import { EcowittAPI } from "./ecowitt";
import { NWSWeatherAPI } from "./nwsWeather";
import { PushbulletClient } from "./pushbullet";
import { RainMachineAPI } from "./rainmachine";
import { getEnvVar } from "./envVar";

async function main() {
    try {
        const nws = new NWSWeatherAPI();
        console.log("Getting forecast...");
        const forecast = await nws.getForecast();
        console.log(forecast);

        const rainMachine = new RainMachineAPI();
        console.log("Authenticating with RainMachine API...");
        await rainMachine.authenticate(getEnvVar("RAIN_MACHINE_PASSWORD"));
        console.log("Authenticated with RainMachine API");

        console.log("Getting watering history...");
        const history = await rainMachine.getWateringHistory(7, 100);
        console.log(history);

        const ecowitt = new EcowittAPI(
            getEnvVar("ECOWITT_API_KEY"),
            getEnvVar("ECOWITT_APPLICATION_KEY")
        );
        console.log("Getting ecowitt devices...");
        const devices = await ecowitt.getDevices();

        const device = devices[0];
        console.log(`Getting data for ${device.name}...`);
        const ecowittHistory = await ecowitt.getDeviceHistory(device.mac, 7);

        console.log("Ecowitt history:");
        console.log(JSON.stringify(ecowittHistory, null, 2));

        const ai = new GoogleAIClient(getEnvVar("GOOGLE_API_KEY"));
        const prompt = generateWateringPrompt(
            history,
            forecast,
            ecowittHistory
        );
        console.log(prompt);
        const response = await ai.sendPrompt(prompt, getEnvVar("GOOGLE_MODEL"));
        console.log(response);

        console.log("Sending Pushbullet notification...");
        const pushbullet = new PushbulletClient(
            getEnvVar("PUSH_BULLET_API_KEY")
        );
        await pushbullet.sendNote("Sprinkler Decision", response);
        console.log("Pushbullet notification sent");
    } catch (error) {
        console.error("Failed:", error);
    }
}

(async () => {
    await main();
})();
