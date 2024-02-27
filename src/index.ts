import { initServer } from "@/server";
import { port } from "@/utils/configs";
import { retrieveAssetConfig } from "@/utils/retrieveAssetConfig";

process.env.AWS_SDK_JS_SUPPRESS_MAINTENANCE_MODE_MESSAGE = "1";
process.env.CHECKPOINT_DISABLE = "1";

// entrypoint
(async () => {
  const server = initServer();

  // need the server to be up for open-id auth to work
  setTimeout(retrieveAssetConfig, 100);

  server.listen(port, () =>
    console.log(
      `[SERVER] : Middleware App listening at http://localhost:${port}`,
    ),
  );
})();
