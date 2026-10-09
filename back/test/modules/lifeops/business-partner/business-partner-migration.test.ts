import {afterAll, beforeAll, beforeEach, describe, expect, it, vi} from "vitest"
import {mongoose} from "@drax/common-back"
import {CreateOrUpdateRole, RoleServiceFactory} from "@drax/identity-back"
import TestSetup from "../../../setup/TestSetup"
import MigrateClientToBusinessPartner from "../../../../src/setup/scripts/MigrateClientToBusinessPartner"
import BusinessPartnerServiceFactory from "../../../../src/modules/lifeops/factory/services/BusinessPartnerServiceFactory"
import BusinessPartnerPermissions from "../../../../src/modules/lifeops/permissions/BusinessPartnerPermissions"
import {BusinessPartnerModel} from "../../../../src/modules/lifeops/models/BusinessPartnerModel"
import {BusinessPartnerBaseSchema} from "../../../../src/modules/lifeops/schemas/BusinessPartnerSchema"
import {ProjectModel} from "../../../../src/modules/lifeops/models/ProjectModel"

describe("BusinessPartner migration", () => {
    const testSetup = new TestSetup({permissions: [BusinessPartnerPermissions]})

    beforeAll(async () => {
        await testSetup.setup()
    })

    beforeEach(async () => {
        for (const name of ['Client', 'BusinessPartner', 'Project', 'Contact', 'Task', 'TaskArchived']) {
            await mongoose.connection.db!.collection(name).deleteMany({})
        }
    })

    afterAll(async () => {
        await testSetup.dropAndClose()
    })

    it("moves documents preserving ids, dates and metadata while removing obsolete roles", async () => {
        const legacy = {
            _id: new mongoose.Types.ObjectId(),
            name: 'Commercial relation',
            roles: ['client', 'provider', 'none', 'prospect'],
            user: new mongoose.Types.ObjectId(testSetup.rootUser._id),
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-02-01'),
            archivedAt: new Date('2026-03-01'),
            aliases: ['Alias'],
            notes: 'Preserve notes',
            __v: 2
        }
        await mongoose.connection.db!.collection('Client').insertOne(legacy)

        await MigrateClientToBusinessPartner()

        const migrated = await BusinessPartnerModel.collection.findOne({_id: legacy._id})
        expect(migrated).toEqual({...legacy, roles: ['client', 'provider']})
        expect(await mongoose.connection.db!.listCollections({name: 'Client'}).hasNext()).toBe(false)
    })

    it("can run repeatedly and leaves no duplicates or recreated legacy collection", async () => {
        const identifier = new mongoose.Types.ObjectId()
        await mongoose.connection.db!.collection('Client').insertOne({
            _id: identifier, name: 'Repeatable', roles: ['provider']
        })

        await MigrateClientToBusinessPartner()
        await MigrateClientToBusinessPartner()

        expect(await BusinessPartnerModel.countDocuments({_id: identifier})).toBe(1)
        expect(await mongoose.connection.db!.listCollections({name: 'Client'}).hasNext()).toBe(false)
    })

    it("keeps existing destination edits when resuming a partially completed migration", async () => {
        const identifier = new mongoose.Types.ObjectId()
        await mongoose.connection.db!.collection('Client').insertOne({
            _id: identifier, name: 'Old name', roles: ['none']
        })
        await BusinessPartnerModel.collection.insertOne({
            _id: identifier, name: 'Edited name', roles: ['provider', 'prospect']
        })

        await MigrateClientToBusinessPartner()

        expect(await BusinessPartnerModel.collection.findOne({_id: identifier})).toMatchObject({
            name: 'Edited name', roles: ['provider']
        })
        expect(await BusinessPartnerModel.countDocuments()).toBe(1)
    })

    it("retains the source on failure after insertion and resumes without duplicates", async () => {
        const identifier = new mongoose.Types.ObjectId()
        const legacyCollection = mongoose.connection.db!.collection('Client')
        await legacyCollection.insertOne({_id: identifier, name: 'Retry', roles: ['client']})
        const originalUpdate = BusinessPartnerModel.collection.updateOne.bind(BusinessPartnerModel.collection)
        const updateSpy = vi.spyOn(BusinessPartnerModel.collection, 'updateOne').mockImplementationOnce(async (...args) => {
            await originalUpdate(...args)
            throw new Error('Simulated interruption after insert')
        })

        try {
            await expect(MigrateClientToBusinessPartner()).rejects.toThrow('Simulated interruption')
        } finally {
            updateSpy.mockRestore()
        }

        expect(await legacyCollection.countDocuments({_id: identifier})).toBe(1)
        await MigrateClientToBusinessPartner()
        expect(await BusinessPartnerModel.countDocuments({_id: identifier})).toBe(1)
        expect(await legacyCollection.countDocuments()).toBe(0)
    })

    it("removes obsolete roles without inventing a commercial role", async () => {
        await mongoose.connection.db!.collection('Client').insertMany([
            {name: 'None', roles: ['none']},
            {name: 'Prospect', roles: ['prospect']},
            {name: 'No roles'}
        ])

        await MigrateClientToBusinessPartner()

        const documents = await BusinessPartnerModel.collection.find({}).toArray()
        expect(documents).toHaveLength(3)
        expect(documents.every(document => document.roles.length === 0)).toBe(true)
    })

    it("renames legacy references including archived tasks and preserves existing new references", async () => {
        const identifier = new mongoose.Types.ObjectId()
        const existingPartner = new mongoose.Types.ObjectId()
        const names = ['Project', 'Contact', 'Task', 'TaskArchived']
        for (const name of names) {
            await mongoose.connection.db!.collection(name).insertMany([
                {name: 'Legacy', client: identifier},
                {name: 'Both', client: identifier, businessPartner: existingPartner},
                {name: 'Explicit null', client: identifier, businessPartner: null},
                {name: 'No relation'}
            ])
        }

        await MigrateClientToBusinessPartner()
        await MigrateClientToBusinessPartner()

        for (const name of names) {
            const collection = mongoose.connection.db!.collection(name)
            expect(await collection.countDocuments({client: {$exists: true}})).toBe(0)
            expect(await collection.findOne({name: 'Legacy'})).toMatchObject({businessPartner: identifier})
            expect(await collection.findOne({name: 'Both'})).toMatchObject({businessPartner: existingPartner})
            expect(await collection.findOne({name: 'Explicit null'})).toMatchObject({businessPartner: null})
            expect(await collection.findOne({name: 'No relation'})).not.toHaveProperty('businessPartner')
        }
    })

    it("preserves custom role permissions using the new permission names without duplicates", async () => {
        const role = await CreateOrUpdateRole({
            name: 'CommercialMigration',
            permissions: ['client:view', 'client:manage', 'businesspartner:view', 'project:view']
        })

        await MigrateClientToBusinessPartner()
        await MigrateClientToBusinessPartner()

        const migrated = await RoleServiceFactory().findById(role._id)
        expect(migrated?.permissions).toEqual(['businesspartner:view', 'businesspartner:manage', 'project:view'])
    })

    it("populates migrated projects with BusinessPartner", async () => {
        const identifier = new mongoose.Types.ObjectId()
        const projectIdentifier = new mongoose.Types.ObjectId()
        await mongoose.connection.db!.collection('Client').insertOne({
            _id: identifier, name: 'Partner', roles: ['client']
        })
        await ProjectModel.collection.insertOne({_id: projectIdentifier, name: 'Project', client: identifier})

        await MigrateClientToBusinessPartner()

        const project = await ProjectModel.findById(projectIdentifier).populate('businessPartner').lean()
        expect(project?.businessPartner?.name).toBe('Partner')
    })

    it("validates only client and provider, supports both, and defaults to empty roles", () => {
        const base = {name: 'Partner', user: testSetup.rootUser._id}
        expect(BusinessPartnerBaseSchema.parse(base).roles).toEqual([])
        expect(BusinessPartnerBaseSchema.parse({...base, roles: ['client', 'provider']}).roles).toEqual(['client', 'provider'])
        expect(BusinessPartnerBaseSchema.safeParse({...base, roles: ['none']}).success).toBe(false)
        expect(BusinessPartnerBaseSchema.safeParse({...base, roles: ['prospect']}).success).toBe(false)
    })

    it("keeps roles and other fields when patching only the name", async () => {
        const service = BusinessPartnerServiceFactory.instance
        const partner = await service.create({
            name: 'Partner', user: testSetup.rootUser._id, roles: ['provider'], notes: 'Keep notes'
        })

        await service.updatePartial(partner._id, {name: 'Updated'} as any)

        expect(await BusinessPartnerModel.findById(partner._id).lean()).toMatchObject({
            name: 'Updated', roles: ['provider'], notes: 'Keep notes'
        })
    })
})
