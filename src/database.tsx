import { addRxPlugin } from "rxdb";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { createRxDatabase } from "rxdb";

addRxPlugin(RxDBDevModePlugin);

export const fileversedb = await createRxDatabase({
  name: "fileversedb",
  storage: getRxStorageDexie(),
});

const collabdocsschema = {
  version: 0,
  primaryKey: "timestamp",
  type: "object",
  properties: {
    id: {
      type: "string",
    },
    content: {
      type: "any",
    },
    timestamp: {
      type: "string",
      maxLength: 100, // <- the primary key must have set maxLength
    },
  },
  required: ["id", "content", "timestamp"],
};

await fileversedb.addCollections({
  collabdocs: {
    schema: collabdocsschema,
  },
});
