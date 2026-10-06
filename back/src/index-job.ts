

import SetupDrax from './setup/SetupDrax.js'
import RunAgentJob from "./jobs/RunAgentJob.js";
import RunDayPlanJob from "./jobs/RunDayPlanJob.js";
import RunTaskArchiveJob from "./jobs/RunTaskArchiveJob.js";
await SetupDrax()

RunAgentJob()
RunDayPlanJob()
RunTaskArchiveJob()
