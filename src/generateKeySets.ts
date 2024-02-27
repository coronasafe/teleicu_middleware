/*
This script generates a `keys.json` JWKS file, this file contains a private and public key in the JWKS format,
Always ensure that there is only one unique keys.json file in a deployment swarm.
Do NOT interact with the `keys.json` file outside the defined wrapper methods.
*/
import fs from "fs";

import { generateKeyPair } from "@/lib/jose";

if (fs.existsSync("keys.json")) {
  console.log("keys.json already exists");
  process.exit(0);
}

generateKeyPair().then((key) => {
  fs.writeFileSync("keys.json", JSON.stringify({ keys: [key] }, null, "  "));
});
