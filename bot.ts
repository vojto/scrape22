import TelegramBot from "node-telegram-bot-api"

const token = "5398158258:AAGR0PLWs4ZVfNZoH0qaPUX97q-qa83NQOE"
const chatIds = ["1624852061"]
const bot = new TelegramBot(token)

export const update = async () => {
  const updates = await bot.getUpdates()

  for (const update of updates) {
    const {message} = update
    const chatId = message?.chat.id
    const text = message?.text
    console.log(`${chatId}: ${text}`)

    bot.processUpdate(update)
  }
}

export const send = async (message: string) => {
  let retries = 3

  for (const chatId of chatIds) {
    while (retries--) {
      try {
        await bot.sendMessage(chatId, message, {
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        })
        break
      } catch (e) {
        console.log(`failed to sent, retrying ${retries}`)
      }
    }
  }
}
