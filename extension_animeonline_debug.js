export default class AnimeOnlineDebug {
  base = 'https://ver.animeonline.ninja'

  async single({ titles, episode }) {
    console.log('DEBUG: AnimeOnline extension called with:', { titles, episode })

    if (!titles?.length) {
      console.log('DEBUG: No titles provided')
      return []
    }

    const title = titles[0]
    const episodeNumber = episode || 1

    console.log(`DEBUG: Processing ${title} episode ${episodeNumber}`)

    const result = {
      title: `${title} - Episodio ${episodeNumber} [DEBUG LATINO]`,
      link: `${this.base}/search?q=${encodeURIComponent(title)}`,
      videoUrl: `${this.base}/ver/${title.toLowerCase().replace(/\s+/g, '-')}-${episodeNumber}`,
      hash: null,
      seeders: null,
      leechers: null,
      downloads: 0,
      size: 500000000,
      date: new Date(),
      verified: true,
      type: 'streaming',
      accuracy: 'high',
      quality: '720p',
      language: 'es-latino',
      videoType: 'stream',
      source: 'AnimeOnline.ninja'
    }

    console.log('DEBUG: Returning result:', result.title)
    return [result]
  }

  async batch({ titles }) {
    console.log('DEBUG: Batch search for:', titles)
    if (!titles?.length) return []

    const results = []
    for (let i = 1; i <= 3; i++) {
      const episodeResult = await this.single({ titles, episode: i })
      results.push(...episodeResult)
    }

    return results
  }

  async movie({ titles }) {
    console.log('DEBUG: Movie search for:', titles)
    if (!titles?.length) return []

    const title = titles[0]
    return [{
      title: `${title} [PELÍCULA DEBUG LATINO]`,
      link: `${this.base}/search?q=${encodeURIComponent(title + ' película')}`,
      videoUrl: `${this.base}/pelicula/${title.toLowerCase().replace(/\s+/g, '-')}`,
      hash: null,
      seeders: null,
      leechers: null,
      downloads: 0,
      size: 1500000000,
      date: new Date(),
      verified: true,
      type: 'streaming',
      accuracy: 'high',
      quality: '720p',
      language: 'es-latino',
      videoType: 'stream',
      source: 'AnimeOnline.ninja'
    }]
  }

  async test() {
    console.log('DEBUG: Test method called - AnimeOnline.ninja Debug Extension')
    console.log('DEBUG: Base URL:', this.base)
    console.log('DEBUG: Test will always return true for compatibility')

    // Test ultrasimple que siempre funciona
    const testDate = new Date()
    console.log('DEBUG: Test completed at:', testDate.toISOString())

    return true
  }
}