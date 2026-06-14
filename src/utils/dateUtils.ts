/**
 * 日付文字列を検証してDateオブジェクトに変換
 * @param dateStr - 検証する日付文字列
 * @returns 有効な場合はDateオブジェクト、無効な場合はundefined
 */
export function validateDate(dateStr: string | undefined): Date | undefined {
  if (!dateStr) return undefined

  try {
    const date = new Date(dateStr)

    // 無効な日付
    if (Number.isNaN(date.getTime())) {
      return undefined
    }

    return date
  } catch {
    return undefined
  }
}
