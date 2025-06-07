import axios, { AxiosInstance } from "axios";
import { getStartDateNDaysAgo } from "./dateUtils";

export type EcowittDevice = {
    id: number;
    name: string;
    mac: string;
};

export type EcowittHistory = {
    date: Date;
    rainfall: number;
    soilPercentage: number;
    soilAd: number;
    temperature: number;
};

// Helper function to aggregate max values by date
function aggregateMaxByDate<T extends { [key: string]: string }>(
    list: T,
    valueKey: "value" | "percentage" = "value",
    offsetHours: number = 7,
    extra?: (numVal: number) => Partial<any>
): Array<{ date: Date; value: number; percentage?: number }> {
    const maxByDate: Record<
        string,
        { date: Date; value: number; percentage?: number }
    > = {};
    Object.entries(list).forEach(([epoch, value]) => {
        const dt = new Date(parseInt(epoch, 10) * 1000);
        const mtDate = new Date(dt.getTime() - offsetHours * 60 * 60 * 1000);
        const dateStr = mtDate.toISOString().slice(0, 10); // YYYY-MM-DD
        const numVal = parseFloat(value as string);
        if (
            !(dateStr in maxByDate) ||
            numVal > (maxByDate[dateStr][valueKey] ?? -Infinity)
        ) {
            maxByDate[dateStr] = {
                date: new Date(dateStr),
                value: valueKey === "value" ? numVal : 0,
                percentage: valueKey === "percentage" ? numVal : undefined,
                ...(extra ? extra(numVal) : {}),
            };
        }
    });
    return Object.values(maxByDate);
}

export class EcowittAPI {
    private client: AxiosInstance;
    private apiKey: string;
    private applicationKey: string;
    private baseURL = "https://api.ecowitt.net/api/v3";

    constructor(apiKey: string, applicationKey: string) {
        this.apiKey = apiKey;
        this.applicationKey = applicationKey;
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                "Content-Type": "application/json",
            },
        });
    }

    /**
     * Fetches list of devices for the configured device.
     */
    public async getDevices(): Promise<EcowittDevice[]> {
        try {
            const response = await this.client.get(`/device/list`, {
                params: {
                    application_key: this.applicationKey,
                    api_key: this.apiKey,
                },
            });
            const results = response.data.data.list;
            return results.map((result: any) => ({
                id: result.id,
                name: result.name,
                mac: result.mac,
            }));
        } catch (error: any) {
            console.error("Ecowitt API error (list):", error.message);
            throw new Error("Failed to fetch devices from Ecowitt API");
        }
    }

    /**
     * Fetches historical data for a device by MAC address and number of days.
     * @param mac The MAC address of the device.
     * @param days Number of days of history to fetch (default 7).
     */
    public async getDeviceHistory(
        mac: string,
        days: number = 7
    ): Promise<EcowittHistory[]> {
        const endDate = getStartDateNDaysAgo(1); // today
        const startDate = getStartDateNDaysAgo(days);
        try {
            const response = await this.client.get(`/device/history`, {
                params: {
                    application_key: this.applicationKey,
                    api_key: this.apiKey,
                    mac,
                    start_date: startDate,
                    end_date: endDate,
                    call_back: "outdoor,rainfall,soil_ch1",
                },
            });
            const rainfall = response.data.data.rainfall;
            const daily = rainfall.daily;
            const unit = daily.unit;
            const dailyArray = aggregateMaxByDate(daily.list).map(
                ({ date, value }) => ({
                    unit,
                    date,
                    value,
                })
            );

            const soil = response.data.data.soil_ch1;
            const soilArray = aggregateMaxByDate(
                soil.soilmoisture.list,
                "percentage"
            ).map((item) => ({
                ...item,
                percentage: item.percentage ?? 0,
            }));
            const adArray = aggregateMaxByDate(soil.ad.list);

            for (const item of soilArray) {
                const adItem = adArray.find(
                    (adItem) =>
                        adItem.date.toISOString() === item.date.toISOString()
                );
                if (adItem) {
                    item.value = adItem.value;
                }
            }

            const outdoor = response.data.data.outdoor;
            const temperatureArray = aggregateMaxByDate(
                outdoor.temperature.list
            );

            return dailyArray.map((item) => ({
                date: item.date,
                rainfall: item.value,
                soilPercentage:
                    soilArray.find(
                        (s) => s.date.toISOString() === item.date.toISOString()
                    )?.percentage ?? 0,
                soilAd:
                    soilArray.find(
                        (s) => s.date.toISOString() === item.date.toISOString()
                    )?.value ?? 0,
                temperature:
                    temperatureArray.find(
                        (t) => t.date.toISOString() === item.date.toISOString()
                    )?.value ?? 0,
            }));
        } catch (error: any) {
            console.error("Ecowitt API error (history):", error.message);
            throw new Error("Failed to fetch device history from Ecowitt API");
        }
    }
}
