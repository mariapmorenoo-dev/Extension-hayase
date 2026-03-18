export default new class NyaaLatino {
  base = 'https://nyaa.si/?page=rss&c=1_2&f=0&q='

  async single({ titles, episode }) {
    if (!titles?.length) return []
    const query = (titles[0] + ' Spanish') + (episode ? ` ${episode.toString().padStart(2, '0')}` : '')
    const url = this.base + encodeURIComponent(query)
    const res = await fetch(url)
    const xml = await res.text()
    return this.map(xml)
  }

  batch = this.single
  movie = this.single

  map(xml) {
    const results = []
    const items = xml.split('<item>').slice(1)
    for (const item of items) {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const hash = link.match(/([a-fA-F0-9]{40})/)?.[1] || ''
      const seeders = parseInt(item.match(/<nyaa:seeders>(.*?)<\/nyaa:seeders>/)?.[1] || '0')
      const size = item.match(/<nyaa:size>(.*?)<\/nyaa:size>/)?.[1] || '0'

      if (!title || !link) continue

      results.push({
        title,
        link,
        hash,
        seeders,
        leechers: 0,
        downloads: 0,
        size: this.parseSize(size),
        date: new Date(),
        verified: false,
        type: 'alt',
        accuracy: 'medium'
      })
    }
    return results
  }

  parseSize(sizeStr) {
    const match = sizeStr.match(/([\d.]+)\s*(KiB|MiB|GiB|KB|MB|GB)/i)
    if (!match) return 0
    const value = parseFloat(match[1])
    const unit = match[2].toUpperCase()
    switch (unit) {
      case 'KIB': case 'KB': return value * 1024
      case 'MIB': case 'MB': return value * 1024 * 1024
      case 'GIB': case 'GB': return value * 1024 * 1024 * 1024
      default: return 0
    }
  }

  async test() {
    try {
      const res = await fetch(this.base + 'one piece')
      return res.ok
    } catch {
      return false
    }
  }
}()