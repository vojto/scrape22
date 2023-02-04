import {cleanString} from "./helpers"
import {Listing} from "./types"

export const isAllowed = (item: Listing) => {
  const blacklist: string[] = [
    "balticka",
    "bukurestska",
    "ciernomorska",
    "cordakova",
    "huskova",
    "kozmonautov",
    "kurska",
    "lomonosovova",
    "nova polhora",
    "podhradova", // sure?
    "nad jazerom",
    "jazero",
    "sidlisku terasa",
    "stierova",
    "varsavska",
    "dargovskych hrdinov",
    "muskatova",
    "wurmova",
    "meteorova",
    "miskovecka",
    "saca",
    "kvp",
    "safarikova",
    "terasa",
    "terase",
    "povazska",
    "orgovanova",
    "zelezniky",
    "presov",
    "tahanovce",
    "pekinska",
    "narodna trieda",
    "furca",
    "zdiarska",
    "kezmarsk",
    "toryska",
    "na hore",
    "tr. snp",
    "panorama",
    "zelena stran",
  ]

  const whitelist = [
    "letna",
    "zimna",
    "jesenna",
    "jarna",
    "jilemnickeho",
    "tehl",
    "komenskeho",
    "masiarska",
    "mlynska",
    "bastova",
    "vojenska",
    "magurska",
  ]

  const tokens = (item.title + " " + item.description).split(/\s+/)

  const isWhitelisted = tokens.some((str) => {
    return whitelist.some((word) => {
      const clean = cleanString(str)
      return clean.startsWith(cleanString(word))
    })
  })

  const isBlacklisted = [item.title, item.description].some((str) => {
    return blacklist.some((word) => {
      const clean = cleanString(str)
      return clean.includes(cleanString(word))
    })
  })

  return isWhitelisted && !isBlacklisted
}
