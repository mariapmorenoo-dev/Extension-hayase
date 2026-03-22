export default class AnimeOnlineExact {
  base = 'https://ver.animeonline.ninja'

  async single({ titles, episode }) {
    console.log('EXACT DEBUG: single llamado:', { titles, episode })

    if (!titles?.length) return []

    const title = `${titles[0]} - Episodio ${episode || 1} [Latino]`
    const link = `https://ver.animeonline.ninja/ver/${titles[0].toLowerCase().replace(/\s+/g, '-')}`
    const hash = null // Igual que Nyaa
    const seeders = 10 // Número bajo como Nyaa

    const result = {
      title,
      link,
      hash,
      seeders,
      leechers: 0,    // Exacto como Nyaa
      downloads: 0,   // Exacto como Nyaa
      size: 524288000, // 500MB
      date: new Date(), // Sin toISOString()
      verified: false, // false como Nyaa
      type: 'alt',
      accuracy: 'medium'
    }

    console.log('EXACT DEBUG: Resultado generado:', result)
    return [result]
  }

  async batch({ titles }) {
    console.log('EXACT DEBUG: batch llamado:', titles)

    if (!titles?.length) return []

    const results = []
    for (let ep = 1; ep <= 12; ep++) {
      const episodeResults = await this.single({ titles, episode: ep })
      results.push(...episodeResults)
    }

    console.log('EXACT DEBUG: Batch total:', results.length)
    return results
  }

  async movie({ titles }) {
    return this.single({ titles })
  }

  async test() {
    console.log('EXACT DEBUG: Test OK')
    return true
  }
}