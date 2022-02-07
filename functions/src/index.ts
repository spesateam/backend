import * as functions from 'firebase-functions';
import * as admin from "firebase-admin";
import {getCitySlug} from "./utils";
import {EventContext} from "firebase-functions/lib/cloud-functions";
import {generateStatsCity, generateStatsDonors} from "./stats";


type DocumentReference = admin.firestore.DocumentReference;
type DocumentSnapshot = admin.firestore.DocumentSnapshot;

const firestoreDoc = functions
    .region('europe-west1')
    .firestore;


export const on_city_receiver_update = firestoreDoc
    .document('/cities/{cityId}/receivers/{userId}')
    .onWrite((change, context) => {

        // if the entry is deleted, we stop
        if (!change.after.exists)
            return Promise.resolve("Deleted");

        const currentStatus = change.after.get("status");

        const shouldUpdateStatus =
            (!change.before.exists || change.before.get("status") !== currentStatus)
            && (currentStatus === "done" || currentStatus === "wip");

        const donorsRefsAfter: DocumentReference[] = change.after.get("donor_matches");
        const donorsRefsBefore: DocumentReference[] = change.before.get("donor_matches");
        if (donorsRefsAfter &&
            donorsRefsAfter !== donorsRefsBefore || shouldUpdateStatus) {
            const updateData: any = {
                receiver_match: change.after.ref
            };

            if (shouldUpdateStatus)
                updateData["status"] = currentStatus;

            donorsRefsAfter.forEach((donorRef) => donorRef.update(
                updateData
            ).catch(console.error));
            console.log("Updated donors", donorsRefsAfter);
        }

        return Promise.resolve("Updated references");
    });



export const on_donor_update = firestoreDoc
    .document('/donors/{userId}')
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


function setInitialStatus(snapshot: DocumentSnapshot) {
    return snapshot.ref.update({
        status: "new",
        added_on: admin.firestore.FieldValue.serverTimestamp(),
    });
}

export const on_donor_create_add_status = firestoreDoc
    .document('/donors/{userId}')
    .onCreate((snapshot, context) => setInitialStatus(snapshot));

export const on_receiver_create_add_status = firestoreDoc
    .document('/cities/{cityId}/receivers/{userId}')
    .onCreate((snapshot, context) => setInitialStatus(snapshot));


async function moveUnderCities(snapshot: DocumentSnapshot, collection: string) {
    const placeId = snapshot.get("address_reference");
    if (!placeId)
        return Promise.reject("No placeId");

    let city = await getCitySlug(placeId);
    if (!city)
        return Promise.reject("No city");

    if (city === "milan")
        city = "milano";

    const data = snapshot.data();
    if (!data)
        return Promise.reject("no data on create?");

    return snapshot.ref.firestore.collection("cities")
        .doc(city)
        .collection(collection)
        .doc(snapshot.id)
        .set(data)
        // .then(() => snapshot.ref.delete())
        .then(() => Promise.resolve("Moved under city " + city))
}

export const on_receiver_create_move_to_cities = firestoreDoc
    .document('/receivers/{userId}')
    .onCreate(async (snapshot, context) => moveUnderCities(snapshot, "receivers"));


function createLogFunction(change: any, context: EventContext) {

    const after: DocumentSnapshot = change.after;
    if (!after.exists)
        return Promise.resolve('Entry has been deleted');

    const revisionReference = after.ref.collection("history").doc();
    const data = after.data();

    if (!data) return Promise.reject();

    if (context.auth && context.auth.uid)
        data.modified_by = context.auth.uid;

    data.modified_on = admin.firestore.FieldValue.serverTimestamp();

    return revisionReference.set(data).then(() => Promise.resolve('New revision created ' + revisionReference.path));
}

export const on_receiver_update_log_revision = firestoreDoc
    .document('/cities/{cityId}/receivers/{userId}')
    .onWrite((change, context) => createLogFunction(change, context));

export const on_donor_update_log_revision = firestoreDoc
    .document('/donors/{userId}')
    .onWrite((change, context) => createLogFunction(change, context));

function generateStats() {
    const firestore = admin.firestore();
    generateStatsDonors(firestore).then((stats) =>
        firestore.collection("donors_stats")
            .doc()
            .set(stats)
    ).catch();

    generateStatsCity(firestore, "milano").then((stats) =>
        firestore.collection("cities/milano/stats")
            .doc()
            .set(stats)
    ).catch();
    console.log('Generating stats!');
    return null;
}

export const scheduled_update_stats = functions.pubsub.schedule('every 24 hours').onRun((context) => {
    return generateStats();
});

export {
    onReceiverCreatedAlgolia,
    onDonorsCreatedAlgolia
} from "./algolia";
