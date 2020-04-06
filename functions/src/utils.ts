import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

type DocumentSnapshot = admin.firestore.DocumentSnapshot;

admin.initializeApp();
const db = admin.firestore();

const toSnakeCase = (someString: string) => {
  return someString
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join("_");
};

/*
  Function that will copy a record to a /{collection}/city/{city}/{reference} collection
  Usage: moveRecordToCityCollection(documentSnapshot, "collection")

*/
const moveRecordToCityCollection = async (
  record: DocumentSnapshot,
  collection: string
) => {
  const recordData = record.data();
  const city = toSnakeCase(recordData.city);
  db.doc(`/${collection}/city/${city}/${record.ref.id}`).set(recordData);
};

export { moveRecordToCityCollection };
