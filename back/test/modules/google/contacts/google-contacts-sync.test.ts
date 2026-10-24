import {beforeEach, describe, expect, it, vi} from "vitest"
import {GoogleContactsService} from "../../../../src/modules/google/services/GoogleContactsService"

const mocks = vi.hoisted(() => ({
    findUserById: vi.fn(),
    findContacts: vi.fn(),
    createContact: vi.fn(),
    updateContact: vi.fn(),
}))

vi.mock("@drax/identity-back", () => ({
    UserServiceFactory: () => ({findById: mocks.findUserById}),
}))
vi.mock("../../../../src/modules/google/factory/services/GoogleConnectionServiceFactory.js", () => ({
    default: {instance: {}},
}))
vi.mock("../../../../src/modules/lifeops/factory/services/ContactServiceFactory.js", () => ({
    default: {instance: {
        find: mocks.findContacts,
        create: mocks.createContact,
        updatePartial: mocks.updateContact,
    }},
}))

const googleContact = {
    resourceName: "people/123",
    names: [{displayName: "Josefina Lacourt", givenName: "Josefina", familyName: "Lacourt"}],
    emailAddresses: [{value: "jose@example.com"}],
}

describe("GoogleContactsService tenant-aware sync", () => {
    let service: GoogleContactsService
    let resolveConnection: ReturnType<typeof vi.spyOn>
    let fetchContacts: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
        vi.resetAllMocks()
        service = new GoogleContactsService()
        resolveConnection = vi.spyOn(service as any, "resolveConnection").mockResolvedValue({_id: "connection"})
        fetchContacts = vi.spyOn(service as any, "fetchContactsForSync").mockResolvedValue([googleContact])
        mocks.findContacts.mockResolvedValue([])
        mocks.createContact.mockImplementation(async input => ({...input, _id: "contact"}))
    })

    it.each(["tenant-a", {_id: "tenant-a", name: "Tenant A"}])(
        "creates contacts with the persisted user's tenant ID (%j), ignoring untrusted tenant fields",
        async tenant => {
            mocks.findUserById.mockResolvedValue({_id: "user", tenant})

            const result = await service.syncContacts({
                userId: "user",
                tenant: "untrusted-tenant",
                tenantId: "untrusted-tenant",
            } as any)

            expect(mocks.findUserById).toHaveBeenCalledExactlyOnceWith("user")
            expect(mocks.findContacts).toHaveBeenCalledExactlyOnceWith({
                filters: [
                    {field: "user", operator: "eq", value: "user"},
                    {field: "tenant", operator: "eq", value: "tenant-a"},
                ],
                limit: 0,
            })
            expect(mocks.createContact).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({
                user: "user",
                tenant: "tenant-a",
                externalId: "people/123",
            }))
            expect(result.created).toBe(1)
        },
    )

    it("updates a matching contact without replacing its populated tenant", async () => {
        mocks.findUserById.mockResolvedValue({_id: "user", tenant: {_id: "tenant-a", name: "Tenant A"}})
        const existing = {
            _id: "contact",
            user: {_id: "user", username: "user"},
            tenant: {_id: "tenant-a", name: "Tenant A"},
            externalId: "people/123",
            displayName: "Josefina",
        }
        mocks.findContacts.mockResolvedValue([existing])
        mocks.updateContact.mockImplementation(async (_id, input) => ({...existing, ...input}))

        const result = await service.syncContacts({userId: "user"})

        expect(result.updated).toBe(1)
        expect(mocks.createContact).not.toHaveBeenCalled()
        expect(mocks.updateContact).toHaveBeenCalledOnce()
        expect(mocks.updateContact.mock.calls[0][0]).toBe("contact")
        expect(mocks.updateContact.mock.calls[0][1]).not.toHaveProperty("tenant")
    })

    it("keeps updateExisting=false from updating matching contacts", async () => {
        mocks.findUserById.mockResolvedValue({_id: "user", tenant: "tenant-a"})
        mocks.findContacts.mockResolvedValue([{_id: "contact", externalId: "people/123"}])

        const result = await service.syncContacts({userId: "user", updateExisting: false})

        expect(result.skipped).toBe(1)
        expect(mocks.createContact).not.toHaveBeenCalled()
        expect(mocks.updateContact).not.toHaveBeenCalled()
    })

    it.each([null, {_id: "user"}, {_id: "user", tenant: null}, {_id: "user", tenant: ""}])(
        "rejects sync before fetching or writing when the user has no tenant (%j)",
        async user => {
            mocks.findUserById.mockResolvedValue(user)

            await expect(service.syncContacts({userId: "user", tenant: "untrusted-tenant"} as any))
                .rejects.toThrow("google.contacts.tenant.required")

            expect(resolveConnection).not.toHaveBeenCalled()
            expect(fetchContacts).not.toHaveBeenCalled()
            expect(mocks.findContacts).not.toHaveBeenCalled()
            expect(mocks.createContact).not.toHaveBeenCalled()
            expect(mocks.updateContact).not.toHaveBeenCalled()
        },
    )
})
