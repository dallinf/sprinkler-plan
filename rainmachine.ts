import axios, { AxiosInstance } from "axios";
import https from "https";
import { WaterDay, WaterHistory } from "./waterHistory";
import { getStartDateNDaysAgo } from "./dateUtils";

export class RainMachineAPI {
    private client: AxiosInstance;
    private baseURL = "https://192.168.86.31:8080";
    private accessToken: string;

    constructor() {
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                "Content-Type": "application/json",
            },
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
        });
        this.accessToken = "";
    }

    public async authenticate(password: string): Promise<void> {
        try {
            const response = await this.client.post("/api/4/auth/login", {
                pwd: password,
                remember: 1,
            });
            const { access_token } = response.data;
            this.accessToken = access_token;
        } catch (error: any) {
            if (error.response) {
                console.error(
                    "RainMachine authentication error:",
                    error.response.status,
                    error.response.statusText
                );
            } else {
                console.error(
                    "RainMachine authentication error:",
                    error.message
                );
            }
            throw new Error("Failed to authenticate with RainMachine API");
        }
    }

    public async getWateringHistory(
        days: number = 7,
        minimumWateringMinutes: number = 10
    ): Promise<WaterHistory> {
        const startDate = getStartDateNDaysAgo(days);
        const response = await this.get(
            `/api/4/watering/log/details/${startDate}/${days}`
        );

        const history = getTotalWateringByDay(response);

        console.log("history", history);
        const filteredHistory = history.days.filter(
            (day: WaterDay) => day.durationMinutes >= minimumWateringMinutes
        );
        return new WaterHistory(filteredHistory);
    }

    public async getForecast(): Promise<any> {
        const response = await this.get("/api/4/mixer/2025-06-05/7");
        console.log("mixer data", response);
        console.log(response.mixerData[0]);
        return response.mixerData[0];
    }

    public async getParsers(): Promise<any[]> {
        const response = await this.get("/api/4/parser");
        const parsers = response.parsers;
        return parsers.filter((parser: any) => parser.enabled === true);
    }

    public async getParserData(parserId: number): Promise<any> {
        const response = await this.get(
            `/api/4/parser/${parserId}/data/2025-05-31/7`
        );
        console.log(response.parserData[0].forecast);
        for (const parser of response.parserData[0].dailyValues) {
            // only log if the hourlyValue has rain
            for (const hourlyValue of parser.hourlyValues) {
                if (hourlyValue.rain != null) {
                    console.log(hourlyValue);
                }
            }
        }
        return response.parser;
    }

    public async getMixer(): Promise<any> {
        const response = await this.get("/api/4/mixer");
        console.log(response.mixerData[0]);
        return response.mixer;
    }

    private async get(endpoint: string): Promise<any> {
        const response = await this.client.get(
            `${endpoint}?access_token=${this.accessToken}`
        );
        return response.data;
    }
}

/**
 * Sums total watering activity for each day in the sample_response.
 * Returns a map of date (YYYY-MM-DD) to total watering minutes.
 */
export function getTotalWateringByDay(sample_response: any): WaterHistory {
    const result: Record<string, number> = {};
    for (const day of sample_response.waterLog.days) {
        let totalSeconds = 0;
        for (const program of day.programs) {
            for (const zone of program.zones) {
                for (const cycle of zone.cycles) {
                    totalSeconds += cycle.realDuration || 0;
                }
            }
        }
        // Convert seconds to minutes
        result[day.date] = Math.round(totalSeconds / 60);
    }
    return new WaterHistory(
        Object.entries(result).map(
            ([date, minutes]) => new WaterDay(date, minutes)
        )
    );
}
