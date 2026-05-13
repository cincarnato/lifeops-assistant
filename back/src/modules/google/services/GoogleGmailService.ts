import {OAuth2Client} from "google-auth-library";
import GoogleConnectionServiceFactory from "../factory/services/GoogleConnectionServiceFactory.js";
import type {IGoogleConnection} from "../interfaces/IGoogleConnection";
import type {
    GoogleGmailAttachment,
    GoogleGmailGetOptions,
    GoogleGmailListOptions,
    GoogleGmailListResult,
    GoogleGmailMessage,
    GoogleGmailMessageAddress,
    GoogleGmailMessageSummary,
} from "../interfaces/IGoogleGmail";

type GmailHeader = {
    name: string;
    value: string;
}

type GmailPart = {
    partId?: string;
    mimeType?: string;
    filename?: string;
    headers?: GmailHeader[];
    body?: {
        data?: string;
        attachmentId?: string;
        size?: number;
    };
    parts?: GmailPart[];
}

type GmailMessageResponse = GmailPart & {
    id: string;
    threadId: string;
    labelIds?: string[];
    snippet?: string;
    historyId?: string;
    internalDate?: string;
    payload?: GmailPart;
}

const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
const GMAIL_MODIFY_SCOPE = "https://www.googleapis.com/auth/gmail.modify";

class GoogleGmailService {

    async listMessages(options: GoogleGmailListOptions): Promise<GoogleGmailListResult> {
        const connection = await this.resolveConnection(options.userId, options.connectionId);
        const accessToken = await this.getAccessToken(connection);
        const query = this.buildSearchQuery(options);
        const params = new URLSearchParams({
            maxResults: String(Math.min(Math.max(Number(options.limit) || 10, 1), 50)),
        });

        if (options.pageToken) {
            params.set("pageToken", options.pageToken);
        }
        if (query) {
            params.set("q", query);
        }
        for (const labelId of options.labelIds || []) {
            if (labelId) {
                params.append("labelIds", labelId);
            }
        }

        const listResponse = await this.gmailFetch<{
            messages?: Array<{id: string; threadId: string}>;
            nextPageToken?: string;
            resultSizeEstimate?: number;
        }>(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, accessToken);

        const messages = await Promise.all(
            (listResponse.messages || []).map(message => this.getMessageMetadata(message.id, accessToken))
        );

        return {
            items: messages,
            nextPageToken: listResponse.nextPageToken,
            resultSizeEstimate: listResponse.resultSizeEstimate || 0,
        };
    }

    async getMessage(options: GoogleGmailGetOptions): Promise<GoogleGmailMessage> {
        const connection = await this.resolveConnection(options.userId, options.connectionId);
        const accessToken = await this.getAccessToken(connection);
        const params = new URLSearchParams({format: "full"});
        const message = await this.gmailFetch<GmailMessageResponse>(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(options.messageId)}?${params.toString()}`,
            accessToken
        );

        return this.mapFullMessage(message);
    }

    private async resolveConnection(userId: string, connectionId?: string): Promise<IGoogleConnection> {
        const service = GoogleConnectionServiceFactory.instance;
        const connection = connectionId
            ? await service.findById(connectionId)
            : (await service.findBy("userId", userId, 20)).find(item => this.canReadGmail(item));

        if (!connection || this.getConnectionUserId(connection) !== userId) {
            throw new Error("google.connection.not_found");
        }

        if (!this.canReadGmail(connection)) {
            throw new Error("google.gmail.scope.required");
        }

        return connection;
    }

    private canReadGmail(connection: IGoogleConnection): boolean {
        return connection.status === "active" && (
            connection.scope?.includes(GMAIL_READONLY_SCOPE) ||
            connection.scope?.includes(GMAIL_MODIFY_SCOPE)
        );
    }

    private getConnectionUserId(connection: IGoogleConnection): string {
        const userId = connection.userId;
        if (typeof userId === "string") {
            return userId;
        }
        return userId?._id?.toString?.() || userId?.id?.toString?.() || "";
    }

    private async getAccessToken(connection: IGoogleConnection): Promise<string> {
        const expiryTime = connection.expiryDate ? new Date(connection.expiryDate).getTime() : 0;
        if (connection.accessToken && expiryTime > Date.now() + 60000) {
            return connection.accessToken;
        }

        const client = new OAuth2Client({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        });
        client.setCredentials({
            refresh_token: connection.refreshToken,
        });

        const {credentials} = await client.refreshAccessToken();
        const accessToken = credentials.access_token;
        if (!accessToken) {
            throw new Error("google.access_token.required");
        }

        await GoogleConnectionServiceFactory.instance.updatePartial(connection._id, {
            accessToken,
            expiryDate: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600000),
            lastUsedAt: new Date(),
        } as any);

        return accessToken;
    }

    private buildSearchQuery(options: GoogleGmailListOptions): string {
        const parts: string[] = [];
        const add = (value?: string) => {
            const trimmed = value?.trim();
            if (trimmed) {
                parts.push(trimmed);
            }
        };

        add(options.search);
        if (options.from) parts.push(`from:${this.quoteQueryValue(options.from)}`);
        if (options.to) parts.push(`to:${this.quoteQueryValue(options.to)}`);
        if (options.subject) parts.push(`subject:${this.quoteQueryValue(options.subject)}`);
        if (options.after) parts.push(`after:${options.after}`);
        if (options.before) parts.push(`before:${options.before}`);
        if (options.unread === true) parts.push("is:unread");
        if (options.unread === false) parts.push("-is:unread");
        if (options.hasAttachment === true) parts.push("has:attachment");
        if (options.hasAttachment === false) parts.push("-has:attachment");

        return parts.join(" ");
    }

    private quoteQueryValue(value: string): string {
        const trimmed = value.trim();
        return /\s/.test(trimmed) ? `"${trimmed.replace(/"/g, '\\"')}"` : trimmed;
    }

    private async getMessageMetadata(messageId: string, accessToken: string): Promise<GoogleGmailMessageSummary> {
        const params = new URLSearchParams({format: "metadata"});
        ["Subject", "From", "To", "Date"].forEach(header => params.append("metadataHeaders", header));
        const message = await this.gmailFetch<GmailMessageResponse>(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?${params.toString()}`,
            accessToken
        );

        return this.mapMessageSummary(message);
    }

    private async gmailFetch<T>(url: string, accessToken: string): Promise<T> {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
            },
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`google.gmail.request_failed:${response.status}:${body}`);
        }

        return await response.json() as T;
    }

    private mapFullMessage(message: GmailMessageResponse): GoogleGmailMessage {
        const summary = this.mapMessageSummary(message);
        const bodies = {text: [] as string[], html: [] as string[]};
        const attachments: GoogleGmailAttachment[] = [];
        this.walkParts(message.payload || message, part => {
            const data = part.body?.data;
            if (data && part.mimeType === "text/plain") {
                bodies.text.push(this.decodeBase64Url(data));
            }
            if (data && part.mimeType === "text/html") {
                bodies.html.push(this.decodeBase64Url(data));
            }
            if (part.filename) {
                attachments.push({
                    id: part.body?.attachmentId,
                    filename: part.filename,
                    mimeType: part.mimeType || "application/octet-stream",
                    size: part.body?.size || 0,
                });
            }
        });

        return {
            ...summary,
            cc: this.parseAddressList(this.getHeader(message, "Cc")),
            bcc: this.parseAddressList(this.getHeader(message, "Bcc")),
            bodyText: bodies.text.join("\n\n") || bodies.html.map(html => this.htmlToText(html)).join("\n\n"),
            bodyHtml: bodies.html.join("\n"),
            attachments,
        };
    }

    private mapMessageSummary(message: GmailMessageResponse): GoogleGmailMessageSummary {
        const labelIds = message.labelIds || [];
        return {
            id: message.id,
            threadId: message.threadId,
            labelIds,
            snippet: message.snippet || "",
            historyId: message.historyId,
            internalDate: message.internalDate,
            subject: this.getHeader(message, "Subject") || "(Sin asunto)",
            from: this.parseAddressList(this.getHeader(message, "From"))[0],
            to: this.parseAddressList(this.getHeader(message, "To")),
            date: this.getHeader(message, "Date"),
            unread: labelIds.includes("UNREAD"),
            starred: labelIds.includes("STARRED"),
            hasAttachments: this.hasAttachments(message.payload || message),
        };
    }

    private getHeader(message: GmailMessageResponse, headerName: string): string {
        const headers = message.payload?.headers || message.headers || [];
        return headers.find(header => header.name.toLowerCase() === headerName.toLowerCase())?.value || "";
    }

    private parseAddressList(value: string): GoogleGmailMessageAddress[] {
        if (!value) {
            return [];
        }

        return value.split(",").map(item => item.trim()).filter(Boolean).map(item => {
            const match = item.match(/^(.*)<([^>]+)>$/);
            if (!match) {
                return {email: item};
            }
            return {
                name: match[1].trim().replace(/^"|"$/g, ""),
                email: match[2].trim(),
            };
        });
    }

    private hasAttachments(part?: GmailPart): boolean {
        if (!part) {
            return false;
        }
        if (part.filename) {
            return true;
        }
        return (part.parts || []).some(child => this.hasAttachments(child));
    }

    private walkParts(part: GmailPart, callback: (part: GmailPart) => void): void {
        callback(part);
        for (const child of part.parts || []) {
            this.walkParts(child, callback);
        }
    }

    private decodeBase64Url(value: string): string {
        return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
    }

    private htmlToText(value: string): string {
        return value
            .replace(/<style[\s\S]*?<\/style>/gi, "")
            .replace(/<script[\s\S]*?<\/script>/gi, "")
            .replace(/<br\s*\/?>/gi, "\n")
            .replace(/<\/p>/gi, "\n\n")
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    }
}

export default GoogleGmailService;
export {GoogleGmailService};
