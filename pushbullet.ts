import axios from "axios";

export class PushbulletClient {
    private apiKey: string;
    private baseURL = "https://api.pushbullet.com/v2";

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    /**
     * Sends a push note to your devices via Pushbullet.
     * @param title The title of the notification
     * @param body The body of the notification
     */
    public async sendNote(title: string, body: string): Promise<any> {
        try {
            const response = await axios.post(
                `${this.baseURL}/pushes`,
                {
                    type: "note",
                    title,
                    body,
                },
                {
                    headers: {
                        "Access-Token": this.apiKey,
                        "Content-Type": "application/json",
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            console.error("Pushbullet API error:", error.message);
            throw new Error(
                "Failed to send push notification via Pushbullet API"
            );
        }
    }
}
