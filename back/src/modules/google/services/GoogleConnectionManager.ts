import {OAuth2Client} from "google-auth-library";
import GoogleConnectionServiceFactory from "../factory/services/GoogleConnectionServiceFactory.js";
import type {IGoogleConnection} from "../interfaces/IGoogleConnection";

type GoogleConnectionPermissionKey =
    | "readMails"
    | "sendMails"
    | "modifyMails"
    | "readCalendar"
    | "createCalendarEvents"
    | "modifyCalendarEvents";

type GoogleConnectionPermission = {
    key: GoogleConnectionPermissionKey;
    label: string;
    scope: string;
}

type GoogleAuthorizationUrlOptions = {
    permissions?: GoogleConnectionPermissionKey[];
    scopes?: string[];
    redirectUri: string;
    state?: string;
}

type GoogleConnectionCallbackOptions = {
    code: string;
    redirectUri: string;
    userId: string;
}

const GOOGLE_IDENTITY_SCOPES = [
    "openid",
    "email",
    "profile",
];

const GOOGLE_CONNECTION_PERMISSIONS: GoogleConnectionPermission[] = [
    {
        key: "readMails",
        label: "Read emails",
        scope: "https://www.googleapis.com/auth/gmail.readonly",
    },
    {
        key: "sendMails",
        label: "Send emails",
        scope: "https://www.googleapis.com/auth/gmail.send",
    },
    {
        key: "modifyMails",
        label: "Modify emails",
        scope: "https://www.googleapis.com/auth/gmail.modify",
    },
    {
        key: "readCalendar",
        label: "Read calendar",
        scope: "https://www.googleapis.com/auth/calendar.readonly",
    },
    {
        key: "createCalendarEvents",
        label: "Create calendar events",
        scope: "https://www.googleapis.com/auth/calendar.events",
    },
    {
        key: "modifyCalendarEvents",
        label: "Modify calendar events",
        scope: "https://www.googleapis.com/auth/calendar.events",
    },
];

class GoogleConnectionManager {

    getAvailablePermissions(): GoogleConnectionPermission[] {
        return GOOGLE_CONNECTION_PERMISSIONS;
    }

    resolveScopes(permissions: GoogleConnectionPermissionKey[] = [], customScopes: string[] = []): string[] {
        const allowedPermissions = new Set(GOOGLE_CONNECTION_PERMISSIONS.map(permission => permission.key));
        const selectedScopes = permissions
            .filter(permission => allowedPermissions.has(permission))
            .map(permission => GOOGLE_CONNECTION_PERMISSIONS.find(item => item.key === permission)?.scope)
            .filter(Boolean) as string[];

        return Array.from(new Set([
            ...GOOGLE_IDENTITY_SCOPES,
            ...selectedScopes,
            ...customScopes.filter(scope => !!scope),
        ]));
    }

    createAuthorizationUrl({permissions = [], scopes = [], redirectUri, state}: GoogleAuthorizationUrlOptions): string {
        const client = this.createOAuthClient(redirectUri);

        return client.generateAuthUrl({
            access_type: "offline",
            include_granted_scopes: true,
            prompt: "consent",
            scope: this.resolveScopes(permissions, scopes),
            state,
        });
    }

    async connectWithCode({code, redirectUri, userId}: GoogleConnectionCallbackOptions): Promise<IGoogleConnection> {
        const client = this.createOAuthClient(redirectUri);
        const {tokens} = await client.getToken(code);
        client.setCredentials(tokens);

        if (!tokens.id_token) {
            throw new Error("google.id_token.required");
        }

        const ticket = await client.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload?.sub || !payload?.email) {
            throw new Error("google.profile.required");
        }

        const service = GoogleConnectionServiceFactory.instance;
        const existingConnection = await service.findOneBy("googleUserId", payload.sub);
        const refreshToken = tokens.refresh_token || existingConnection?.refreshToken;

        if (!refreshToken) {
            throw new Error("google.refresh_token.required");
        }

        const data = {
            userId,
            provider: "google",
            googleEmail: payload.email,
            googleUserId: payload.sub,
            accessToken: tokens.access_token || existingConnection?.accessToken,
            refreshToken,
            scope: this.parseScopes(tokens.scope),
            expiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(),
            status: "active",
            lastUsedAt: new Date(),
            connectedAt: existingConnection?.connectedAt || new Date(),
        };

        if (existingConnection) {
            return await service.updatePartial(existingConnection._id, data);
        }

        return await service.create(data);
    }

    private parseScopes(scope?: string | null): string[] {
        if (!scope) {
            return [];
        }

        return Array.from(new Set(scope.split(" ").filter(item => !!item)));
    }

    private createOAuthClient(redirectUri: string): OAuth2Client {
        return new OAuth2Client({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            redirectUri,
        });
    }
}

export default GoogleConnectionManager;
export {
    GoogleConnectionManager,
    GOOGLE_CONNECTION_PERMISSIONS,
};
export type {
    GoogleConnectionPermission,
    GoogleConnectionPermissionKey,
    GoogleAuthorizationUrlOptions,
    GoogleConnectionCallbackOptions,
};
