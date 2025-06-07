// @ts-ignore
import AmbientWeatherApi from "ambient-weather-api";
import { getStartDateNDaysAgo } from "./dateUtils";

type Device = {
    macAddress: string;
    info: {
        name: string;
    };
};

type DeviceData = {
    dailyrainin: number;
    tempf: number;
    date: Date;
};

export class AmbientWeatherAPI {
    private api: any;
    private apiKey: string;
    private applicationKey: string;

    constructor(apiKey: string, applicationKey: string) {
        this.apiKey = apiKey;
        this.applicationKey = applicationKey;
        this.api = new AmbientWeatherApi({
            apiKey: this.apiKey,
            applicationKey: this.applicationKey,
        });
    }

    /**
     * Lists the user's devices.
     */
    public async getUserDevices(): Promise<Device[]> {
        try {
            const devices = await this.api.userDevices();
            return devices.map((device: any) => ({
                macAddress: device.macAddress,
                info: device.info,
            }));
        } catch (error: any) {
            console.error(
                "AmbientWeather API error (userDevices):",
                error.message
            );
            throw new Error(
                "Failed to fetch user devices from Ambient Weather API"
            );
        }
    }

    /**
     * Fetches the latest data for a given device MAC address.
     * @param deviceMac The MAC address of the Ambient Weather device.
     * @param options Optional parameters (e.g., limit, endDate)
     */
    public async getLatestDeviceData(
        deviceMac: string,
        days: number = 7
    ): Promise<DeviceData[]> {
        try {
            const startDate = getStartDateNDaysAgo(days);

            const data = await this.api.deviceData(deviceMac, {
                endDate: startDate,
                limit: 100,
            });
            return data.map((item: any) => ({
                dailyrainin: item.dailyrainin,
                tempf: item.tempf,
                date: item.date,
            }));
        } catch (error: any) {
            console.error(
                "AmbientWeather API error (deviceData):",
                error.message
            );
            throw new Error(
                "Failed to fetch device data from Ambient Weather API"
            );
        }
    }
}
