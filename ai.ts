import { GoogleGenAI } from "@google/genai";
import { WaterDay, WaterHistory } from "./waterHistory";
import { NWSForecastPeriod } from "./nwsWeather";
import { EcowittHistory } from "./ecowitt";

export class GoogleAIClient {
    private genAI: GoogleGenAI;

    constructor(apiKey: string) {
        this.genAI = new GoogleGenAI({ apiKey });
    }

    /**
     * Sends a prompt to Google Gemini and returns the generated response.
     * @param prompt The prompt string to send.
     * @param model The model to use.
     * @param maxTokens The maximum number of tokens to generate (default: 256).
     */
    public async sendPrompt(prompt: string, model: string): Promise<string> {
        try {
            const result = await this.genAI.models.generateContent({
                model,
                contents: [
                    {
                        role: "user",
                        parts: [{ text: prompt }],
                    },
                ],
            });
            return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        } catch (error: any) {
            console.error("Google Gemini API error:", error.message);
            throw new Error("Failed to get response from Google Gemini API");
        }
    }
}

/**
 * Generates a prompt for an LLM to recommend watering based on history, forecast, and soil conditions.
 * @param wateringHistory Array of objects representing past watering events or summary string
 * @param forecast Array of forecast periods (NWSForecastPeriod[])
 * @param soilConditions Object or string describing current soil conditions
 * @returns A string prompt for the LLM
 */
export function generateWateringPrompt(
    wateringHistory: WaterHistory,
    forecast: NWSForecastPeriod[],
    ecowittHistory: EcowittHistory[]
): string {
    // Format watering history
    const historyStr = wateringHistory.days
        .map((w: WaterDay) => {
            return `Date: ${w.date}, Duration: ${w.durationMinutes}`;
        })
        .join("\n");
    // Format forecast
    const forecastStr = Array.isArray(forecast)
        ? forecast
              .map(
                  (f: any) =>
                      `${f.name}: ${f.shortForecast}, Temp: ${f.temperature}${
                          f.temperatureUnit
                      }, Precip: ${
                          f.probabilityOfPrecipitation
                              ? f.probabilityOfPrecipitation.value + "%"
                              : "N/A"
                      }`
              )
              .join("\n")
        : String(forecast);
    // Format soil conditions
    const soilStr = ecowittHistory
        .map((h: EcowittHistory) => {
            return `Date: ${
                h.date.toISOString().split("T")[0]
            }, Soil Percentage: ${h.soilPercentage}, Soil AD: ${
                h.soilAd
            }, Temperature: ${h.temperature}F`;
        })
        .join("\n");

    return `
You are a landscaper who is an expert in lawn watering practices. You live in Farmington, Utah where water is a precious resource.

Your job is to determine if we should water the lawn tomorrow. Your decision should be based on the data provided.

Watering History:
${historyStr}

Weather Forecast:
${forecastStr}

Soil history:
${soilStr}

Guidelines:
- We strive to conserve water. We should water a maximum of 3 days per week.
- We should never water two days in a row.
- We should water the lawn when the soil is dry.
- We should avoid watering there is a high chance of rain in the next 24 hours.

Provide a yes or no answer of whether we should water the lawn tomorrow. Justify your answer based on the data provided.`;
}
