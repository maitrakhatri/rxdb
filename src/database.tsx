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
  // url to the CouchDB endpoint (required)
  url: "http://127.0.0.1:5984/fileversedb/",
  /**
   * true for live replication,
   * false for a one-time replication.
   * [default=true]
   */
  live: true,
  /**
   * A custom fetch() method can be provided
   * to add authentication or credentials.
   * Can be swapped out dynamically
   * by running 'replicationState.fetch = newFetchMethod;'.
   * (optional)
   */
  pull: {
    /**
     * Amount of documents to be fetched in one HTTP request
     * (optional)
     */
    batchSize: 60,
    /**
     * Custom modifier to mutate pulled documents
     * before storing them in RxDB.
     * (optional)
     */
    /**
     * Heartbeat time in milliseconds
     * for the long polling of the changestream.
     * @link https://docs.couchdb.org/en/3.2.2-docs/api/database/changes.html
     * (optional, default=60000)
     */
    heartbeat: 60000,
  },
  push: {
    /**
     * How many local changes to process at once.
     * (optional)
     */
    batchSize: 60,
    /**
     * Custom modifier to mutate documents
     * before sending them to the CouchDB endpoint.
     * (optional)
     */
  },
});
