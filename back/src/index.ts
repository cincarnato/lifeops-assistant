import path from "path";
import {fileURLToPath} from "url";

import RunServiceTransactionJob from './jobs/RunServiceTransactionJob.js'
import type {ServiceTransactionJobScheduler} from './jobs/RunServiceTransactionJob.js'
import SetupDrax from './setup/SetupDrax.js'
await SetupDrax(true)

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));

import FastifyServerFactory from './factories/FastifyServerFactory.js'

const PORT = parseInt(process.env.DRAX_PORT) || 8080;
const serverYogaFastify = FastifyServerFactory(ROOT_DIR)
let serviceTransactionScheduler: ServiceTransactionJobScheduler | undefined
serverYogaFastify.fastifyHook('onClose', async () => {
    await serviceTransactionScheduler?.stop()
})
await serverYogaFastify.start(PORT);
serviceTransactionScheduler = RunServiceTransactionJob()


