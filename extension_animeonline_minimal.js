export default class AnimeOnlineMinimal {
  base = 'https://ver.animeonline.ninja'

  async single({ titles, episode }) {
    console.log('MINIMAL: single called with:', titles, episode)
    if (!titles?.length) return []

    return [{
      title: `${titles[0]} - Episodio ${episode || 1} [MINIMAL TEST]`,
      link: `${this.base}/search?q=${encodeURIComponent(titles[0])}`,
      videoUrl: `${this.base}/ver/${titles[0].toLowerCase().replace(/\s+/g, '-')}-${episode || 1}`,
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
    }]
  }

  async batch({ titles }) {
    console.log('MINIMAL: batch called with:', titles)
    if (!titles?.length) return []

    const results = []
    for (let i = 1; i <= 3; i++) {
      const episodeResult = await this.single({ titles, episode: i })
      results.push(...episodeResult)
    }
    return results
  }

  async movie({ titles }) {
    console.log('MINIMAL: movie called with:', titles)
    if (!titles?.length) return []

    return [{
      title: `${titles[0]} [PELÍCULA MINIMAL TEST]`,
      link: `${this.base}/search?q=${encodeURIComponent(titles[0] + ' película')}`,
      videoUrl: `${this.base}/pelicula/${titles[0].toLowerCase().replace(/\s+/g, '-')}`,
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
    console.log('MINIMAL: Test starting...')
    console.log('MINIMAL: Base URL is:', this.base)
    console.log('MINIMAL: Test completed successfully')
    return true
  }
}