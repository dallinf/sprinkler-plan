import axios from "axios";

export class TwilioClient {
    private accountSid: string;
    private authToken: string;
    private baseURL: string;

    constructor(accountSid: string, authToken: string) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.baseURL = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
    }

    /**
     * Sends an SMS message using Twilio.
     * @param from The Twilio phone number (e.g., "+1234567890")
     * @param to The recipient's phone number (e.g., "+1234567890")
     * @param body The message body
     */
    public async sendSMS(from: string, to: string, body: string): Promise<any> {
        const url = `${this.baseURL}/Messages.json`;
        const params = new URLSearchParams();
        params.append("From", from);
        params.append("To", to);
        params.append("Body", body);
        try {
            const response = await axios.post(url, params, {
                auth: {
                    username: this.accountSid,
                    password: this.authToken,
                },
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
            return response.data;
        } catch (error: any) {
            console.error("Twilio API error:", error.message);
            throw new Error("Failed to send SMS via Twilio API");
        }
    }
}
