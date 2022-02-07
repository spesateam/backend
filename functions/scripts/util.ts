import * as admin from "firebase-admin";

export function initServiceAccountFirestore(prod: boolean = false) {

    console.log("Init script firestore");

    // you may need to create this file from the cloud console
    const serviceAccount = require("../../../../spesa-sospesa-d1f76f90832e.json");

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    const fs = admin.firestore();
    const settings = {timestampsInSnapshots: true};
    fs.settings(settings);
    return fs;
}
