import {getBazosListings} from "./bazos"
import {truncate} from "lodash"
import {Listing} from "./types"
import {isAllowed} from "./whitelist"
import * as bot from "./bot"
import {hasListing, saveListing} from "./db"
import sleep from "./plugins/sleep"
import {getRealityListings} from "./reality"

const main = async () => {
  await bot.update()

  let realityItems = await getRealityListings()
  realityItems = realityItems.filter(isAllowed)
  handleNewListings(realityItems)

  const bazosListings = await getBazosListings()
  handleNewListings(bazosListings)
}

const handleNewListings = async (listings: Listing[]) => {
  console.log("collected", listings.length, "listings")

  for (const item of listings) {
    if (await hasListing(item)) {
      // console.log("existing listing", item.title)
      // Do nothing
    } else {
      console.log("notified about listing", item.title)

      const formattedPrice =
        typeof item.price === "number"
          ? item.price >= 1000
            ? `${(item.price / 1000).toFixed(1)}k€`
            : `${item.price}€`
          : item.price?.trim()

      const description = truncate(item.description, {length: 256})

      let message = `*${item.title}* (${description}) ${item.link}`
      message = formattedPrice ? `*[${formattedPrice}]* ${message}` : message

      bot.send(message)
      await saveListing(item)
    }

    await sleep(100)
  }
}

main()
