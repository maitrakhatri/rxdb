import { addRxPlugin } from "rxdb";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { createRxDatabase } from "rxdb";
import { replicateCouchDB } from "rxdb/plugins/replication-couchdb";

addRxPlugin(RxDBDevModePlugin);

export const db = await createRxDatabase({
  name: "newdb",
  storage: getRxStorageDexie(),
});

const collabdocsschema = {
  version: 0,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100, 
    },
    content: {
      type: "string",
    },
    timestamp: {
      type: "string",
    },
  },
  required: ["id", "content", "timestamp"],
};

await db.addCollections({
  collabdocs: {
    schema: collabdocsschema,
  },
});

export const dbCollection = db.collabdocs
export const replicationState = replicateCouchDB({
  collection: db.collabdocs,
  url: "http://127.0.0.1:5984/joshua/",
  live: true,
  pull: {
    batchSize: 60,
    heartbeat: 60000,
  },
  push: {
    batchSize: 60,
  },
});