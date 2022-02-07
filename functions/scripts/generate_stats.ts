import * as admin from "firebase-admin";

import {initServiceAccountFirestore} from "./util";
import {generateStatsCity, generateStatsDonors} from "../src/stats";

initServiceAccountFirestore(true);

const firestore = admin.firestore();
// generateStatsCity(firestore, "milano").then(console.log);
// generateStatsDonors(firestore).then(console.log);

function generateStats() {
    generateStatsDonors(firestore).then((stats) =>
        firestore.collection("donors_stats")
            .doc()
            .set(stats)
    );

    generateStatsCity(firestore, "milano").then((stats) =>
        firestore.collection("cities/milano/stats")
            .doc()
            .set(stats)
    );
    console.log('Generating stats!');
    return null;
}
generateStats();