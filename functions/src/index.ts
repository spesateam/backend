import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });


type DocumentReference = admin.firestore.DocumentReference;
export const on_receiver_update = functions
    .region('europe-west1')
    .firestore
    .document('/receiver/{userId}')
    .onWrite((change, context) => {

        // if the entry is deleted, we stop
        if (!change.after.exists)
            return Promise.resolve("Deleted");

        const shouldUpdateStatus = !change.before.exists || change.before.get("status") !== change.after.get("status");

        const contributorRefAfter: DocumentReference = change.after.get("contributor_match");
        const contributorRefBefore: DocumentReference = change.before.get("contributor_match");
        if (contributorRefAfter  && contributorRefAfter !== contributorRefBefore || shouldUpdateStatus) {
            contributorRefAfter.update({
                status: change.after.get("status"),
                receiver_match: change.after.ref
            }).catch(console.error);
            console.log("Updated contributor", contributorRefAfter);
        }

        const donorsRefsAfter: DocumentReference[] = change.after.get("donor_matches");
        const donorsRefsBefore: DocumentReference[] = change.before.get("donor_matches");
        if (donorsRefsAfter && donorsRefsAfter !== donorsRefsBefore || shouldUpdateStatus) {
            donorsRefsAfter.forEach((donorRef) => donorRef.update(
                {
                    status: change.after.get("status"),
                    receiver_match: change.after.ref
                }
            ).catch(console.error));
            console.log("Updated donors", donorsRefsAfter);
        }

        return Promise.resolve("Updated references");
    });