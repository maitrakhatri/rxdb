import { createRxDatabase } from "rxdb";
import {
  pullQueryBuilderFromRxSchema,
  pullStreamBuilderFromRxSchema,
  pushQueryBuilderFromRxSchema,
  replicateGraphQL,
} from "rxdb/plugins/replication-graphql";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";

export const fileversedb = await createRxDatabase({
  name: "fileversedb",
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
    updatedAt: {
      type: "number",
    },
  },
  required: ["id", "updatedAt"],
};

const graphQLGenerationInput = {
  Collabdocs: {
    schema: collabdocsschema,
    checkpointFields: ["id", "updatedAt"],
    deletedField: "deleted",
    // headerFields: ["Authorization"],
  },
};

const batchSize = 50;

const pullQueryBuilder = pullQueryBuilderFromRxSchema(
  "Collabdocs",
  graphQLGenerationInput.Collabdocs
);
const pushQueryBuilder = pushQueryBuilderFromRxSchema(
  "Collabdocs",
  graphQLGenerationInput.Collabdocs
);

const pullStreamBuilder = pullStreamBuilderFromRxSchema(
  "Collabdocs",
  graphQLGenerationInput.Collabdocs
);

await fileversedb.addCollections({
  Collabdocs: {
    schema: collabdocsschema,
  },
});

export const replicationState = replicateGraphQL({
  collection: fileversedb.Collabdocs,
  // urls to the GraphQL endpoints
  url: {
    http: "http://localhost:10102/graphql",
  },
  push: {
    batchSize,
    queryBuilder: pushQueryBuilder,
  },
  pull: {
    batchSize,
    queryBuilder: pullQueryBuilder,
    modifier: (doc) => {
      //Wwe have to remove optional non-existent field values
      // they are set as null by GraphQL but should be undefined
      Object.entries(doc).forEach(([k, v]) => {
        if (v === null) {
          delete doc[k];
        }
      });
      return doc;
    },
    // streamQueryBuilder: pullStreamBuilder,
  },
  // headers which will be used in http requests against the server.
  //   headers: {
  //     Authorization: "Bearer abcde...",
  //   },

  /**
   * Options that have been inherited from the RxReplication
   */
  deletedField: "deleted",
  live: true,
  retryTime: 1000 * 5,
  waitForLeadership: true,
  autoStart: true,
});
