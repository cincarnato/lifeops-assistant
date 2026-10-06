import {describe, expect, it} from "vitest"
import {GoogleContactsService} from "../../../../src/modules/google/services/GoogleContactsService"

const service = new GoogleContactsService() as any

describe("GoogleContactsService contact mapping", () => {
    it("maps the simple editable Google name fields without sending output-only displayName", () => {
        const input = service.mapLifeOpsContactToGoogleCreateInput({
            displayName: "Josefina Lacourt",
            givenName: "Josefina",
            familyName: "Lacourt",
            nickname: "Jose",
            emails: [{value: "jose@example.com", type: "work", displayName: "Josefina", primary: true}],
            phones: [],
            addresses: [],
            organization: {name: "TC MAX", domain: "tcmax.example"},
        })
        const body = service.buildCreateContactBody(input)

        expect(body.names[0]).toEqual({
            givenName: "Josefina",
            familyName: "Lacourt",
        })
        expect(body.names[0]).not.toHaveProperty("displayName")
        expect(body.emailAddresses[0].displayName).toBe("Josefina")
        expect(body.organizations[0].domain).toBe("tcmax.example")
    })

    it("retains Google-derived names, email display name, canonical phone and organization domain", () => {
        const contact = service.mapContact({
            resourceName: "people/123",
            etag: "etag",
            metadata: {sources: [{type: "CONTACT", id: "123", etag: "source-etag"}]},
            names: [{
                displayName: "Josefina Lacourt",
                givenName: "Josefina",
                familyName: "Lacourt",
            }],
            emailAddresses: [{value: "jose@example.com", displayName: "Josefina", type: "work"}],
            phoneNumbers: [{value: "+54 9 3544 54-7845", canonicalForm: "+5493544547845", type: "mobile"}],
            organizations: [{name: "TC MAX", domain: "tcmax.example", current: true}],
        })

        expect(contact.names[0].displayName).toBe("Josefina Lacourt")
        expect(contact.emailAddresses[0].displayName).toBe("Josefina")
        expect(contact.phoneNumbers[0].canonicalForm).toBe("+5493544547845")
        expect(contact.organizations[0].domain).toBe("tcmax.example")
        expect(contact.metadata.sources[0].etag).toBe("source-etag")
    })

    it("extracts only supported base64 image data URLs", () => {
        expect(service.extractPhotoBytes("data:image/png;base64,YWJjZA==")).toBe("YWJjZA==")
        expect(service.extractPhotoBytes("https://example.com/photo.png")).toBeUndefined()
        expect(service.extractPhotoBytes("data:text/plain;base64,YWJjZA==")).toBeUndefined()
    })

    it("updates photos through the dedicated Google endpoint", async () => {
        const photoService = new GoogleContactsService() as any
        photoService.resolveConnection = async () => ({_id: "connection"})
        photoService.getAccessToken = async () => "token"
        photoService.peopleFetch = async (url: string, token: string, options: RequestInit) => {
            expect(url).toBe("https://people.googleapis.com/v1/people/123:updateContactPhoto")
            expect(token).toBe("token")
            expect(options.method).toBe("PATCH")
            expect(JSON.parse(String(options.body))).toMatchObject({photoBytes: "YWJjZA=="})
            return {person: {resourceName: "people/123", photos: [{url: "https://google/photo.jpg"}]}}
        }

        const updated = await photoService.updateContactPhoto({
            userId: "user",
            resourceName: "people/123",
            photoBytes: "YWJjZA==",
        })

        expect(updated.photos[0].value).toBe("https://google/photo.jpg")
    })
})
