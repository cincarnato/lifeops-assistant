import {GoogleAuth} from "google-auth-library";

interface IFirebasePushInput {
    token: string;
    title: string;
    body: string;
    type?: string;
}

interface IFirebasePushResult {
    providerMessageId: string;
}

class FirebasePushService {
    private readonly scope = "https://www.googleapis.com/auth/firebase.messaging";

    async send(input: IFirebasePushInput): Promise<IFirebasePushResult> {
        const projectId = this.getProjectId();
        const accessToken = await this.getAccessToken();
        const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: {
                    token: input.token,
                    notification: {
                        title: input.title,
                        body: input.body,
                    },
                    data: {
                        type: input.type ?? "test",
                    },
                },
            }),
        });

        const responseBody = await response.json().catch(async () => ({error: await response.text()}));
        if (!response.ok) {
            const message = responseBody?.error?.message ?? responseBody?.error ?? "Firebase push send failed";
            throw new Error(message);
        }

        return {
            providerMessageId: responseBody.name,
        };
    }

    private async getAccessToken(): Promise<string> {
        const auth = new GoogleAuth(this.getAuthOptions());
        const client = await auth.getClient();
        const tokenResponse = await client.getAccessToken();
        const token = typeof tokenResponse === "string" ? tokenResponse : tokenResponse?.token;

        if (!token) {
            throw new Error("Firebase credentials did not return an access token");
        }

        return token;
    }

    private getAuthOptions() {
        const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
        if (serviceAccountJson) {
            return {
                credentials: JSON.parse(serviceAccountJson),
                scopes: [this.scope],
            };
        }

        const keyFile = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
        if (keyFile) {
            return {
                keyFile,
                scopes: [this.scope],
            };
        }

        return {
            scopes: [this.scope],
        };
    }

    private getProjectId(): string {
        const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
        if (!projectId) {
            throw new Error("FIREBASE_PROJECT_ID is required to send Firebase push messages");
        }

        return projectId;
    }
}

export default FirebasePushService;
export {FirebasePushService};
export type {IFirebasePushInput, IFirebasePushResult};
