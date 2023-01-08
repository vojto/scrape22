import axios from "axios"
import * as cheerio from "cheerio"
import hash from "object-hash"
import sleep from "./plugins/sleep"
import {Listing} from "types"
import * as bot from "./bot"
import {hasListing, saveListing} from "./db"

const cleanString = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

const isAllowed = (item: Listing) => {
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

const SERVER_ROOT = "https://reality.bazos.sk"

const createUrl = (page: number) => {
  const offset = page * 20

  const params = new URLSearchParams({
    hlokalita: "04001",
    humkreis: "10",
  })

  const path = offset === 0 ? `predam/byt` : `predam/byt/${offset}`
  const base = `${SERVER_ROOT}/${path}`
  return `${base}/?${params.toString()}`
}

const main = async () => {
  await bot.update()

  console.log("scraping!")

  const items: Listing[] = []

  for (let page = 0; page < 10; page++) {
    const url = createUrl(page)

    console.log("url:", url)

    const {data} = await axios.get(url)
    const $ = cheerio.load(data)

    $("div.inzeraty").each((idx, el) => {
      const title = $(el).find("h2.nadpis a").text()
      const link = $(el).find("h2.nadpis a").attr("href")
      const description = $(el).find("div.popis").text().trim()
      const price = $(el).find("div.inzeratycena b").text().trim()

      const item: Listing = {
        title,
        link: `${SERVER_ROOT}${link}`,
        description,
        price,
        hash: hash({title, description, price}),
      }
      const allowed = isAllowed(item)

      if (!allowed) {
        return
      }

      items.push(item)
    })

    for (const item of items) {
      if (await hasListing(item)) {
        // console.log("existing listing", item.title)
        // Do nothing
      } else {
        console.log("notified about listing", item.title)
        bot.send(`*${item.title}* (${item.description}) ${item.link}`)
        await saveListing(item)
      }

      await sleep(100)
    }
  }
}

main()
