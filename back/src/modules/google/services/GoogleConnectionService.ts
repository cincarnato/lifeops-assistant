
import {OAuth2Client} from "google-auth-library";
import type{IGoogleConnectionRepository} from "../interfaces/IGoogleConnectionRepository";
import type {IGoogleConnectionBase, IGoogleConnection} from "../interfaces/IGoogleConnection";
import {AbstractService} from "@drax/crud-back";
import type {ZodObject, ZodRawShape} from "zod";

class GoogleConnectionService extends AbstractService<IGoogleConnection, IGoogleConnectionBase, IGoogleConnectionBase> {


    constructor(GoogleConnectionRepository: IGoogleConnectionRepository, baseSchema?: ZodObject<ZodRawShape>, fullSchema?: ZodObject<ZodRawShape>) {
        super(GoogleConnectionRepository, baseSchema, fullSchema);
        
        this._validateOutput = true
        
    }

    async getValidAccessToken(connection: IGoogleConnection): Promise<string> {
        const expiryTime = connection.expiryDate ? new Date(connection.expiryDate).getTime() : 0;
        if (connection.accessToken && expiryTime > Date.now() + 60000) {
            await this.updatePartial(connection._id, {
                lastUsedAt: new Date(),
            } as any);
            return connection.accessToken;
        }

        const client = new OAuth2Client({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        });
        client.setCredentials({
            refresh_token: connection.refreshToken,
        });

        try {
            const {credentials} = await client.refreshAccessToken();
            const accessToken = credentials.access_token;
            if (!accessToken) {
                throw new Error("google.access_token.required");
            }

            await this.updatePartial(connection._id, {
                accessToken,
                expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600000),
                status: "active",
                lastUsedAt: new Date(),
            } as any);

            return accessToken;
        } catch (error) {
            if (this.isInvalidGrantError(error)) {
                await this.updatePartial(connection._id, {
                    accessToken: "",
                    status: "revoked",
                    expiryDate: new Date(0),
                    lastUsedAt: new Date(),
                } as any);
                throw new Error("google.connection.reauthorization_required");
            }

            throw error;
        }
    }

    async revokeUserConnections(userId: string): Promise<{revoked: number; failed: number}> {
        const connections = await this.findBy("userId", userId, 1000);
        let revoked = 0;
        let failed = 0;

        for (const connection of connections) {
            try {
                await this.revokeConnection(connection);
                revoked++;
            } catch (error) {
                failed++;
                console.error("google.connection.revoke_failed", {
                    connectionId: connection._id,
                    userId,
                    error,
                });
            }
        }

        return {revoked, failed};
    }

    async revokeConnection(connection: IGoogleConnection): Promise<void> {
        const token = connection.refreshToken || connection.accessToken;
        let revokeError: unknown = null;

        if (token) {
            const client = new OAuth2Client({
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            });

            try {
                await client.revokeToken(token);
            } catch (error) {
                if (!this.isInvalidGrantError(error)) {
                    revokeError = error;
                }
            }
        }

        await this.updatePartial(connection._id, {
            accessToken: "",
            status: "revoked",
            expiryDate: new Date(0),
            lastUsedAt: new Date(),
        } as any);

        if (revokeError) {
            throw revokeError;
        }
    }

    private isInvalidGrantError(error: unknown): boolean {
        const candidate = error as any;
        return candidate?.response?.data?.error === "invalid_grant" ||
            candidate?.message === "invalid_grant" ||
            candidate?.code === "invalid_grant";
    }

}

export default GoogleConnectionService
export {GoogleConnectionService}
