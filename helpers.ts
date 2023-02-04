import he from "he"

export function unescapeHtmlEntities(html: string): string {
  html = html.replace(/&amp;nbsp;/g, " ")
  return he.decode(html)
}

export const cleanString = (str: string) => {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}
