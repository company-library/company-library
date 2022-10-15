/**
 * useSWRで使用する、一番シンプルなfetcher
 * Ref: https://swr.vercel.app/ja/docs/data-fetching
 * @param {string} url
 * @returns {Promise<any>}
 */
const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default fetcher
