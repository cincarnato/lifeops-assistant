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
    GoogleGmailModifyLabelsOptions,
    GoogleGmailModifyLabelsResult,
    GoogleGmailSendOptions,
    GoogleGmailSendResult,
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
const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
const GMAIL_FULL_SCOPE = "https://mail.google.com/";

class GoogleGmailService {

    async listMessages(options: GoogleGmailListOptions): Promise<GoogleGmailListResult> {
        const connection = await this.resolveReadConnection(options.userId, options.connectionId);
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
        const connection = await this.resolveReadConnection(options.userId, options.connectionId);
        const accessToken = await this.getAccessToken(connection);
        const params = new URLSearchParams({format: "full"});
        const message = await this.gmailFetch<GmailMessageResponse>(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(options.messageId)}?${params.toString()}`,
            accessToken
        );

        return this.mapFullMessage(message);
    }

    async sendMessage(options: GoogleGmailSendOptions): Promise<GoogleGmailSendResult> {
        const connection = await this.resolveSendConnection(options.userId, options.connectionId);
        const accessToken = await this.getAccessToken(connection);
        const raw = this.encodeBase64Url(this.buildRawMessage(options));
        const response = await this.gmailFetch<GoogleGmailSendResult>(
            "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
            accessToken,
            {
                method: "POST",
                body: JSON.stringify({
                    raw,
                    threadId: options.threadId,
                }),
            }
        );

        return response;
    }

    async modifyLabels(options: GoogleGmailModifyLabelsOptions): Promise<GoogleGmailModifyLabelsResult> {
        const addLabelIds = this.normalizeLabelIds(options.addLabelIds);
        const removeLabelIds = this.normalizeLabelIds(options.removeLabelIds);
        if (!addLabelIds.length && !removeLabelIds.length) {
            throw new Error("google.gmail.labels.required");
        }

        const connection = await this.resolveModifyConnection(options.userId, options.connectionId);
        const accessToken = await this.getAccessToken(connection);
        const response = await this.gmailFetch<GoogleGmailModifyLabelsResult>(
            `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(options.messageId)}/modify`,
            accessToken,
            {
                method: "POST",
                body: JSON.stringify({
                    addLabelIds,
                    removeLabelIds,
                }),
            }
        );

        return {
            id: response.id,
            threadId: response.threadId,
            labelIds: response.labelIds || [],
        };
    }

    private async resolveReadConnection(userId: string, connectionId?: string): Promise<IGoogleConnection> {
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

    private async resolveSendConnection(userId: string, connectionId?: string): Promise<IGoogleConnection> {
        const service = GoogleConnectionServiceFactory.instance;
        const connection = connectionId
            ? await service.findById(connectionId)
            : (await service.findBy("userId", userId, 20)).find(item => this.canSendGmail(item));

        if (!connection || this.getConnectionUserId(connection) !== userId) {
            throw new Error("google.connection.not_found");
        }

        if (!this.canSendGmail(connection)) {
            throw new Error("google.gmail.send_scope.required");
        }

        return connection;
    }

    private async resolveModifyConnection(userId: string, connectionId?: string): Promise<IGoogleConnection> {
        const service = GoogleConnectionServiceFactory.instance;
        const connection = connectionId
            ? await service.findById(connectionId)
            : (await service.findBy("userId", userId, 20)).find(item => this.canModifyGmail(item));

        if (!connection || this.getConnectionUserId(connection) !== userId) {
            throw new Error("google.connection.not_found");
        }

        if (!this.canModifyGmail(connection)) {
            throw new Error("google.gmail.modify_scope.required");
        }

        return connection;
    }

    private canReadGmail(connection: IGoogleConnection): boolean {
        return connection.status === "active" && (
            connection.scope?.includes(GMAIL_READONLY_SCOPE) ||
            connection.scope?.includes(GMAIL_MODIFY_SCOPE) ||
            connection.scope?.includes(GMAIL_FULL_SCOPE)
        );
    }

    private canModifyGmail(connection: IGoogleConnection): boolean {
        return connection.status === "active" && (
            connection.scope?.includes(GMAIL_MODIFY_SCOPE) ||
            connection.scope?.includes(GMAIL_FULL_SCOPE)
        );
    }

    private canSendGmail(connection: IGoogleConnection): boolean {
        return connection.status === "active" && (
            connection.scope?.includes(GMAIL_SEND_SCOPE) ||
            connection.scope?.includes(GMAIL_FULL_SCOPE)
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
        return await GoogleConnectionServiceFactory.instance.getValidAccessToken(connection);
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

    private normalizeLabelIds(labelIds?: string[]): string[] {
        return Array.from(new Set(
            (labelIds || [])
                .map(labelId => labelId.trim())
                .filter(Boolean)
        ));
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

    private async gmailFetch<T>(url: string, accessToken: string, init: RequestInit = {}): Promise<T> {
        const response = await fetch(url, {
            ...init,
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/json",
                ...(init.body ? {"Content-Type": "application/json"} : {}),
                ...init.headers,
            },
        });

        if (!response.ok) {
            const body = await response.text();
            throw new Error(`google.gmail.request_failed:${response.status}:${body}`);
        }

        return await response.json() as T;
    }

    private buildRawMessage(options: GoogleGmailSendOptions): string {
        if (!options.to?.length) {
            throw new Error("google.gmail.to.required");
        }

        const hasBody = Boolean(options.bodyText?.trim() || options.bodyHtml?.trim());
        if (!hasBody) {
            throw new Error("google.gmail.body.required");
        }

        const headers = [
            `To: ${this.formatAddressHeader(options.to)}`,
            ...(options.cc?.length ? [`Cc: ${this.formatAddressHeader(options.cc)}`] : []),
            ...(options.bcc?.length ? [`Bcc: ${this.formatAddressHeader(options.bcc)}`] : []),
            ...(options.replyTo ? [`Reply-To: ${this.sanitizeHeaderValue(options.replyTo)}`] : []),
            `Subject: ${this.encodeHeaderValue(options.subject || "")}`,
            "MIME-Version: 1.0",
        ];

        if (options.bodyHtml?.trim() && options.bodyText?.trim()) {
            const boundary = `lifeops_${Date.now()}_${Math.random().toString(16).slice(2)}`;
            return [
                ...headers,
                `Content-Type: multipart/alternative; boundary="${boundary}"`,
                "",
                `--${boundary}`,
                "Content-Type: text/plain; charset=UTF-8",
                "Content-Transfer-Encoding: 8bit",
                "",
                options.bodyText,
                `--${boundary}`,
                "Content-Type: text/html; charset=UTF-8",
                "Content-Transfer-Encoding: 8bit",
                "",
                options.bodyHtml,
                `--${boundary}--`,
                "",
            ].join("\r\n");
        }

        const isHtml = Boolean(options.bodyHtml?.trim());
        return [
            ...headers,
            `Content-Type: ${isHtml ? "text/html" : "text/plain"}; charset=UTF-8`,
            "Content-Transfer-Encoding: 8bit",
            "",
            isHtml ? options.bodyHtml : options.bodyText,
            "",
        ].join("\r\n");
    }

    private formatAddressHeader(addresses: string[]): string {
        return addresses
            .map(address => this.sanitizeHeaderValue(address))
            .filter(Boolean)
            .join(", ");
    }

    private sanitizeHeaderValue(value: string): string {
        return value.replace(/[\r\n]+/g, " ").trim();
    }

    private encodeHeaderValue(value: string): string {
        const sanitized = this.sanitizeHeaderValue(value);
        return /^[\x00-\x7F]*$/.test(sanitized)
            ? sanitized
            : `=?UTF-8?B?${Buffer.from(sanitized, "utf8").toString("base64")}?=`;
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

    private encodeBase64Url(value: string): string {
        return Buffer.from(value, "utf8")
            .toString("base64")
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, "");
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
