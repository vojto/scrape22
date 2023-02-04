import axios from "axios"
import * as cheerio from "cheerio"
import {isEqual} from "lodash"
import hash from "object-hash"
import {Listing} from "types"
import {unescapeHtmlEntities} from "./helpers"

export const getRealityListings = async () => {
  let listings: Listing[] = []

  for (let i = 1; i <= 5; i++) {
    const pageListings = await getRealityPage(i)
    listings = listings.concat(pageListings)
  }

  return listings
}

const getRealityPage = async (page: number) => {
  const url = `https://www.reality.sk/byty/kosice/predaj/?order=created_date-newest&page=${page}`

  const {data} = await axios.get(url)
  const $ = cheerio.load(data)

  const json = getScriptData($)

  if (!json) {
    return []
  }

  const items = json.itemListElement.map((item: any) => ({
    ...item.mainEntity,
    url: item.url,
  }))

  const listings = items.map((item: any) => ({
    title: unescapeHtmlEntities(item.name),
    link: item.url,
    description: unescapeHtmlEntities(item.description),
    price: item.offers[0]?.price,
    hash: hash({
      title: item.name,
      description: item.description,
      price: item.offers.price,
    }),
  }))

  console.log("scraped", url, "found", listings.length, "listings")

  return listings
}

const getScriptData = ($: cheerio.CheerioAPI) => {
  let result: any | null

  $('script[type="application/ld+json"]').each((idx, el) => {
    let content = $(el).html() ?? ""
    content = content.replace(/\n/g, " ")

    try {
      const data = JSON.parse(content)

      if (isEqual(data["@type"], ["Place", "ItemList"])) {
        result = data
      }
    } catch (e) {
      // try the next one
    }
  })

  return result
}
