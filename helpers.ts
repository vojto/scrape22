import he from "he"

export function unescapeHtmlEntities(html: string): string {
  html = html.replace(/&amp;nbsp;/g, " ")
  return he.decode(html)
}
