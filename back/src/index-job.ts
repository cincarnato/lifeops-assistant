

import SetupDrax from './setup/SetupDrax.js'
import RunAgentJob from "./jobs/RunAgentJob.js";
import RunDayPlanJob from "./jobs/RunDayPlanJob.js";
import RunTaskArchiveJob from "./jobs/RunTaskArchiveJob.js";
import RunTaskScheduleJob from "./jobs/RunTaskScheduleJob.js";
await SetupDrax()

RunAgentJob()
RunDayPlanJob()
RunTaskArchiveJob()
RunTaskScheduleJob()
