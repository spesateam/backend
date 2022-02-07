import * as functions from 'firebase-functions';
import algoliasearch from "algoliasearch";

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;

const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

export const onReceiverCreatedAlgolia = functions.firestore
    .document('/cities/{cityId}/receivers/{userId}')
    .onCreate((snap, context) => {
        return indexInAlgolia(context.params.cityId + "_receivers", snap.data(), context.params.userId);
    });

export const onDonorsCreatedAlgolia = functions.firestore
    .document('/donors/{userId}')
    .onCreate((snap, context) => {
        return indexInAlgolia("donors", snap.data(), context.params.userId);
    });

export function indexInAlgolia(indexName: string, data: any, id: string) {
    const entry = {...data};
    entry.objectID = id;
    const index = client.initIndex(indexName);
    return index.saveObject(entry).then(console.log);
}