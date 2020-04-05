import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

const moveRecordToCityCollection = async (record, collection) => {
  const recordData = record.data();
  const city = recordData.city;
  db.doc(`/${collection}/city/${city}/${record.doc()}`).set(recordData);
  recordData.delete();
};

export { moveRecordToCityCollection };
