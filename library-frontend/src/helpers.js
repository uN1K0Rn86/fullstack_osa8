export const uniqueByName = b => {
  let seen = new Set()
  return b.filter(item => {
    let k = item.title
    return seen.has(k) ? false : seen.add(k)
  })
}

export const updateCache = (cache, query, modifier) => {
  cache.updateQuery(query, prev => {
    if (!prev) return prev
    return modifier(prev)
  })
}
