export default class AnimeOnlineResults {
  base = 'https://ver.animeonline.ninja'

  async single({ titles, episode }) {
    console.log('DEBUG RESULTS: single llamado con:', { titles, episode })

    if (!titles?.length) {
      console.log('DEBUG RESULTS: No hay títulos')
      return []
    }

    const results = [
      {
        title: `${titles[0]} - Episodio ${episode || 1} [LATINO TEST]`,
        link: `https://ver.animeonline.ninja/ver/${titles[0].toLowerCase().replace(/\s+/g, '-')}-episodio-${episode || 1}`,
        hash: 'abc123def456789012345678901234567890abcd',
        seeders: 150,
        leechers: 25,
        downloads: 500,
        size: 524288000,
        date: new Date().toISOString(),
        verified: true,
        type: 'alt',
        accuracy: 'high'
      },
      {
        title: `${titles[0]} - Episodio ${episode || 1} [LATINO ALT]`,
        link: `https://www3.animeonline.ninja/ver/${titles[0]}`,
        hash: 'def456789012345678901234567890abcdef123',
        seeders: 89,
        leechers: 12,
        downloads: 300,
        size: 400000000,
        date: new Date().toISOString(),
        verified: false,
        type: 'alt',
        accuracy: 'medium'
      }
    ]

    console.log('DEBUG RESULTS: Devolviendo resultados:', results)
    return results
  }

  async batch({ titles }) {
    console.log('DEBUG RESULTS: batch llamado con:', titles)

    if (!titles?.length) return []

    const results = []
    for (let ep = 1; ep <= 5; ep++) {
      const episodeResults = await this.single({ titles, episode: ep })
      results.push(...episodeResults)
    }

    console.log('DEBUG RESULTS: Total batch results:', results.length)
    return results
  }

  async movie({ titles }) {
    console.log('DEBUG RESULTS: movie llamado con:', titles)

    if (!titles?.length) return []

    const results = [
      {
        title: `${titles[0]} - PELÍCULA [LATINO]`,
        link: `https://ver.animeonline.ninja/pelicula/${titles[0].toLowerCase().replace(/\s+/g, '-')}`,
        hash: 'movie123456789012345678901234567890abcd',
        seeders: 200,
        leechers: 15,
        downloads: 1000,
        size: 1073741824,
        date: new Date().toISOString(),
        verified: true,
        type: 'alt',
        accuracy: 'high'
      }
    ]

    console.log('DEBUG RESULTS: Movie results:', results)
    return results
  }

  async test() {
    console.log('DEBUG RESULTS: Test ejecutado correctamente')
    return true
  }
}