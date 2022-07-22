import * as dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import { DailyRound } from "./utils/dailyRoundUtils.js";

DailyRound.performDailyRound()