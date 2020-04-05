import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


export const on_receiver_update = functions
    .region('europe-west1')
    .firestore
    .document('/receiver/{userId}')
    .onWrite((change, context) => {

        // if the entry is deleted, we stop
        if (!change.after.exists)
            return Promise.resolve("Deleted");

        const contributorRefAfter: admin.firestore.DocumentReference = change.after.get("contributor_match");
        const contributorRefBefore: admin.firestore.DocumentReference = change.before.get("contributor_match");
        if (contributorRefAfter !== contributorRefBefore) {
            contributorRefAfter.update("receiver_match", change.after.ref).catch(console.error);
            console.log("Added receiver match to", contributorRefAfter);
        }

        // const donorsRefsAfter: admin.firestore.DocumentReference[] = change.after.get("donor_matches");
        // const donorsRefsBefore: admin.firestore.DocumentReference[] = change.before.get("donor_matches");
        // if (donorsRefsAfter !== donorsRefsBefore) {
        //     contributorRefAfter.update("receiver_match", change.after.ref).catch(console.error);
        //     console.log("Added receiver match to", contributorRefAfter);
        // }

        return Promise.resolve("Updated references");
    });

export const on_contributor_update = functions
    .region('europe-west1')
    .firestore
    .document('/contributor/{userId}')
    .onWrite((change, context) => {

        // if the entry is deleted, we stop
        if (!change.after.exists)
            return Promise.resolve("Deleted");

        const receiverRefAfter: admin.firestore.DocumentReference = change.after.get("receiver_match");
        const receiverRefBefore: admin.firestore.DocumentReference = change.before.get("receiver_match");
        if (receiverRefAfter !== receiverRefBefore) {
            receiverRefAfter.update("contributor_match", change.after.ref).catch(console.error);
            console.log("Added contributor match to", receiverRefAfter);
        }

        return Promise.resolve("Updated references");
    });

export const on_donor_update = functions
    .region('europe-west1')
    .firestore
    .document('/donor/{userId}')
    .onWrite((change, context) => {

        // if the entry is deleted, we stop
        if (!change.after.exists)
            return Promise.resolve("Deleted");

        const receiverRefAfter: admin.firestore.DocumentReference = change.after.get("receiver_match");
        const receiverRefBefore: admin.firestore.DocumentReference = change.before.get("receiver_match");
        if (receiverRefAfter !== receiverRefBefore) {
            receiverRefAfter.update({
                donor_matches: admin.firestore.FieldValue.arrayUnion(change.after.ref)
            }).catch(console.error);
            console.log("Added donor match to", receiverRefAfter);
        }

        return Promise.resolve("Updated references");
    });