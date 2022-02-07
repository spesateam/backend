import * as admin from "firebase-admin";

export async function generateStatsCity(firestore: admin.firestore.Firestore, city: string) {
    let res: any = {created_on: admin.firestore.FieldValue.serverTimestamp()};

    await firestore.collection(`cities/${city}/receivers`)
        .get()
        .then((snapshot) => {
            const docs = snapshot.docs.filter(d => d.get("status") !== "rejected");
            res["receiversCount"] = docs.length;
        });
    return res;
}

export async function generateStatsDonors(firestore: admin.firestore.Firestore) {
    let res: any = {created_on: admin.firestore.FieldValue.serverTimestamp()};
    await firestore.collection("donors")
        .get()
        .then((snapshot) => {
            const donorsTotalAmount = snapshot.docs.map(d => parseInt(d.get("amount"))).reduce((a, b) => a + b);
            res["donorsCount"] = snapshot.docs.length;
            res["donorsTotalAmount"] = donorsTotalAmount;
        });
    return res;
}