import * as admin from "firebase-admin";

import {initServiceAccountFirestore} from "./util";

initServiceAccountFirestore(true);

const firestore = admin.firestore();
firestore.collection("donors")
    .where("status", "==", "wip")
    .get()
    .then((snapshot) => {
         snapshot.docs.forEach(d => console.log(d.ref.update("status", "done")));
    });
// firestore.collection("donors")
//     .get()
//     .then((snapshot) => {
//         const donorsTotalAmount = snapshot.docs.map(d => parseInt(d.get("amount"))).reduce((a, b) => a + b);
//         console.log("donorsCount", snapshot.docs.length);
//         console.log("donorsTotalAmount", donorsTotalAmount);
//     });
//
// firestore.collection("cities/milano/receivers")
//     .get()
//     .then((snapshot) => {
//         const docs = snapshot.docs.filter(d => d.get("status") !== "rejected");
//         console.log("matchesCount", docs.filter(d => d.get("carrier_match")).length);
//         console.log("receiversCount", docs.length);
//     });