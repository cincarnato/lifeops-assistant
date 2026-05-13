import type {FastifyReply, FastifyRequest} from "fastify";
import GoogleGmailServiceFactory from "../factory/GoogleGmailServiceFactory.js";

type GoogleGmailListQuery = {
    connectionId?: string;
    limit?: number;
    pageToken?: string;
    search?: string;
    labelIds?: string | string[];
    from?: string;
    to?: string;
    subject?: string;
    after?: string;
    before?: string;
    unread?: string | boolean;
    hasAttachment?: string | boolean;
}

type GoogleGmailGetParams = {
    id: string;
}

class GoogleGmailController {

    async list(request: FastifyRequest<{Querystring: GoogleGmailListQuery}>, reply: FastifyReply) {
        try {
            const userId = this.getAuthenticatedUserId(request);
            if (!userId) {
                reply.code(401);
                return reply.send({error: "error.unauthorized"});
            }

            const query = request.query || {};
            return await GoogleGmailServiceFactory.instance.listMessages({
                userId,
                connectionId: query.connectionId,
                limit: Number(query.limit) || 10,
                pageToken: query.pageToken,
                search: query.search,
                labelIds: this.parseLabelIds(query.labelIds),
                from: query.from,
                to: query.to,
                subject: query.subject,
                after: query.after,
                before: query.before,
                unread: this.parseBoolean(query.unread),
                hasAttachment: this.parseBoolean(query.hasAttachment),
            });
        } catch (e) {
            console.error("/api/google/gmail/messages error", e);
            reply.code(500);
            reply.send({error: e?.message || "error.server"});
        }
    }

    async get(request: FastifyRequest<{Params: GoogleGmailGetParams; Querystring: {connectionId?: string}}>, reply: FastifyReply) {
        try {
            const userId = this.getAuthenticatedUserId(request);
            if (!userId) {
                reply.code(401);
                return reply.send({error: "error.unauthorized"});
            }

            if (!request.params?.id) {
                reply.code(400);
                return reply.send({error: "google.gmail.message_id.required"});
            }

            return await GoogleGmailServiceFactory.instance.getMessage({
                userId,
                connectionId: request.query?.connectionId,
                messageId: request.params.id,
            });
        } catch (e) {
            console.error("/api/google/gmail/messages/:id error", e);
            reply.code(500);
            reply.send({error: e?.message || "error.server"});
        }
    }

    private getAuthenticatedUserId(request: FastifyRequest): string {
        return (request as any).authUser?.id || (request as any).rbac?.user?.id || "";
    }

    private parseLabelIds(value?: string | string[]): string[] {
        if (!value) {
            return [];
        }
        const values = Array.isArray(value) ? value : value.split(",");
        return values.map(item => item.trim()).filter(Boolean);
    }

    private parseBoolean(value?: string | boolean): boolean | undefined {
        if (value === undefined || value === null || value === "") {
            return undefined;
        }
        if (typeof value === "boolean") {
            return value;
        }
        return value === "true" || value === "1";
    }
}

export default GoogleGmailController;
export {GoogleGmailController};
