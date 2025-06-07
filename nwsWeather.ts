import axios from "axios";

export type NWSForecastPeriod = {
    name: string;
    startTime: string;
    endTime: string;
    temperature: number;
    temperatureUnit: string;
    windSpeed: string;
    windDirection: string;
    shortForecast: string;
    detailedForecast: string;
};

export class NWSWeatherAPI {
    // Farmington, UT coordinates
    private latitude = 40.58017;
    private longitude = -111.54253;
    private userAgent = "Sprinkler Agent (dallin.frandsen@gmail.com)"; // Replace with your info

    /**
     * Fetches the weather forecast for Farmington, UT from the NWS API.
     */
    public async getForecast(): Promise<NWSForecastPeriod[]> {
        try {
            // Step 1: Get gridpoint info for the coordinates
            const pointsUrl = `https://api.weather.gov/points/${this.latitude},${this.longitude}`;
            const pointsResp = await axios.get(pointsUrl, {
                headers: { "User-Agent": this.userAgent },
            });
            const forecastUrl = pointsResp.data.properties.forecast;
            // Step 2: Get the forecast
            const forecastResp = await axios.get(forecastUrl, {
                headers: { "User-Agent": this.userAgent },
            });
            return forecastResp.data.properties.periods;
        } catch (error: any) {
            console.error("NWS API error:", error.message);
            throw new Error("Failed to fetch weather forecast from NWS API");
        }
    }
}
