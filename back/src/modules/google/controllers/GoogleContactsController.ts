import type {FastifyReply, FastifyRequest} from "fastify";
import GoogleContactsServiceFactory from "../factory/GoogleContactsServiceFactory.js";
import type {GoogleContactsCreateInput} from "../interfaces/IGoogleContacts";

type GoogleContactsListQuery = {
    connectionId?: string;
    limit?: number;
    pageToken?: string;
    personFields?: string | string[];
    sortOrder?: "LAST_MODIFIED_ASCENDING" | "LAST_MODIFIED_DESCENDING" | "FIRST_NAME_ASCENDING" | "LAST_NAME_ASCENDING";
}

type GoogleContactsCreateBody = GoogleContactsCreateInput & {
    connectionId?: string;
}

type GoogleContactsSyncBody = {
    connectionId?: string;
    limit?: number;
    updateExisting?: boolean;
}

class GoogleContactsController {

    async list(request: FastifyRequest<{Querystring: GoogleContactsListQuery}>, reply: FastifyReply) {
        try {
            if (!request.authUser?.id) {
                reply.code(401);
                return reply.send({error: "error.unauthorized"});
            }

            const query = request.query || {} as GoogleContactsListQuery;
            return await GoogleContactsServiceFactory.instance.listContacts({
                userId: request.authUser.id,
                connectionId: query.connectionId,
                limit: query.limit ? Number(query.limit) : undefined,
                pageToken: query.pageToken,
                personFields: this.parsePersonFields(query.personFields),
                sortOrder: query.sortOrder,
            });
        } catch (e) {
            console.error("/api/google/contacts error", e);
            reply.code(500);
            return reply.send({error: e?.message || "error.server"});
        }
    }

    async create(request: FastifyRequest<{Body: GoogleContactsCreateBody}>, reply: FastifyReply) {
        try {
            if (!request.authUser?.id) {
                reply.code(401);
                return reply.send({error: "error.unauthorized"});
            }

            const body = request.body || {} as GoogleContactsCreateBody;
            return await GoogleContactsServiceFactory.instance.createContact({
                userId: request.authUser.id,
                connectionId: body.connectionId,
                contact: {
                    displayName: body.displayName,
                    givenName: body.givenName,
                    familyName: body.familyName,
                    middleName: body.middleName,
                    emailAddresses: body.emailAddresses,
                    phoneNumbers: body.phoneNumbers,
                    organizations: body.organizations,
                    addresses: body.addresses,
                    urls: body.urls,
                    biography: body.biography,
                },
            });
        } catch (e) {
            console.error("/api/google/contacts create error", e);
            reply.code(500);
            return reply.send({error: e?.message || "error.server"});
        }
    }

    async sync(request: FastifyRequest<{Body: GoogleContactsSyncBody}>, reply: FastifyReply) {
        try {
            if (!request.authUser?.id) {
                reply.code(401);
                return reply.send({error: "error.unauthorized"});
            }

            const body = request.body || {} as GoogleContactsSyncBody;
            return await GoogleContactsServiceFactory.instance.syncContacts({
                userId: request.authUser.id,
                connectionId: body.connectionId,
                limit: body.limit ? Number(body.limit) : undefined,
                updateExisting: body.updateExisting,
            });
        } catch (e) {
            console.error("/api/google/contacts sync error", e);
            reply.code(500);
            return reply.send({error: e?.message || "error.server"});
        }
    }

    private parsePersonFields(personFields?: string | string[]): string[] | undefined {
        if (!personFields) {
            return undefined;
        }
        if (Array.isArray(personFields)) {
            return personFields;
        }
        return personFields.split(",").map(field => field.trim()).filter(Boolean);
    }
}

export default GoogleContactsController;
export {GoogleContactsController};
