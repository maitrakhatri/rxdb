import { addRxPlugin } from "rxdb";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";
import { createRxDatabase } from "rxdb";
import { replicateCouchDB } from "rxdb/plugins/replication-couchdb";

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

const collabdocscollection = await fileversedb.addCollections({
  collabdocs: {
    schema: collabdocsschema,
  },
});

export const replicationState = replicateCouchDB({
  collection: collabdocscollection.collabdocs,
  url: "http://127.0.0.1:5984/fileversedb/",
  live: true,
  pull: {
    batchSize: 60,
    heartbeat: 60000,
  },
  push: {
    batchSize: 60,
  },
});
