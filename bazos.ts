import axios from "axios"
import * as cheerio from "cheerio"
import hash from "object-hash"
import {isAllowed} from "./whitelist"
import {Listing} from "./types"

export const getBazosListings = async () => {
  let listings: Listing[] = []

  for (let page = 0; page < 10; page++) {
    const url = createUrl(page)

    const {data} = await axios.get(url)
    const $ = cheerio.load(data)
    let pageListings: Listing[] = []

    $("div.inzeraty").each((idx, el) => {
      const title = $(el).find("h2.nadpis a").text()
      const link = $(el).find("h2.nadpis a").attr("href")
      const description = $(el).find("div.popis").text().trim()
      const price = $(el).find("div.inzeratycena b").text().trim()

      const listing: Listing = {
        title,
        link: `${SERVER_ROOT}${link}`,
        description,
        price,
        hash: hash({title, description, price}),
      }

      pageListings.push(listing)
    })

    pageListings = pageListings.filter(isAllowed)

    console.log("scraped url:", url, "whitelisted", pageListings.length)

    listings = listings.concat(pageListings)
  }

  return listings
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
