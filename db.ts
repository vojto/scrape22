import admin from "firebase-admin"
import {Listing} from "types"

var serviceAccount = require("./firebase.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

export const db = admin.firestore()

export const saveListing = async (listing: Listing) => {
  await db.collection("listings").doc(listing.hash).set(listing)
}

export const hasListing = async (listing: Listing) => {
  const doc = await db.collection("listings").doc(listing.hash).get()
  return doc.exists
}
