import * as admin from "firebase-admin";

import {initServiceAccountFirestore} from "./util";
import {indexInAlgolia} from "../src/algolia";

initServiceAccountFirestore(true);

const firestore = admin.firestore();
firestore.collection("/cities/milano/receivers")
    .get()
    .then((snapshot) =>
        snapshot.docs.forEach(d => {
            indexInAlgolia("milano_receivers", d.data(), d.id);
        }));

firestore.collection("donors")
    .get()
    .then((snapshot) =>
        snapshot.docs.forEach(d => {
            indexInAlgolia("donors", d.data(), d.id);
        }));