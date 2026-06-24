

import SetupDrax from './setup/SetupDrax.js'
import RunAgentJob from "./jobs/RunAgentJob.js";
import RunDayPlanJob from "./jobs/RunDayPlanJob.js";
await SetupDrax()

RunAgentJob()
RunDayPlanJob()
