export const formatForSearch = (str: string): string => {
  const zenkaku2hankaku = (str: string) => {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xfee0)
    })
  }

  return zenkaku2hankaku(str).toUpperCase()
}
