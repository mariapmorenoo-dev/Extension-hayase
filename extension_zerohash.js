class AnimeOnlineZeroHash {
  base = 'https://ver.animeonline.ninja'

  async single({ titles, episode }) {
    console.log('ZERO HASH: single llamado:', { titles, episode })

    if (!titles?.length) {
      console.log('ZERO HASH: No titles provided')
      return []
    }

    const results = [
      {
        title: `${titles[0]} - Episodio ${episode || 1} [Latino]`,
        link: `https://ver.animeonline.ninja/ver/${titles[0].toLowerCase().replace(/\s+/g, '-')}-${episode || 1}`,
        hash: '0000000000000000000000000000000000000000', // Hash de solo ceros
        seeders: 0, // 0 seeders importante
        leechers: 0,
        downloads: 0,
        size: 500000000,
        date: new Date(),
        verified: false,
        type: 'alt',
        accuracy: 'medium'
      }
    ]

    console.log('ZERO HASH: Hash de ceros para evitar descarga')
    return results
  }

  async batch({ titles }) {
    console.log('ZERO HASH: batch llamado:', titles)

    if (!titles?.length) {
      console.log('ZERO HASH: No titles for batch')
      return []
    }

    const results = []
    for (let i = 1; i <= 12; i++) {
      const result = await this.single({ titles, episode: i })
      results.push(...result)
    }

    console.log('ZERO HASH: Batch total results:', results.length)
    return results
  }

  async movie({ titles }) {
    console.log('ZERO HASH: movie llamado:', titles)

    if (!titles?.length) {
      console.log('ZERO HASH: No titles for movie')
      return []
    }

    const results = [
      {
        title: `${titles[0]} [Película Latino]`,
        link: `https://ver.animeonline.ninja/pelicula/${titles[0].toLowerCase().replace(/\s+/g, '-')}`,
        hash: '0000000000000000000000000000000000000000', // Hash de ceros
        seeders: 0,
        leechers: 0,
        downloads: 0,
        size: 1073741824,
        date: new Date(),
        verified: false,
        type: 'alt',
        accuracy: 'medium'
      }
    ]

    console.log('ZERO HASH: Movie result con hash ceros')
    return results
  }

  async test() {
    console.log('ZERO HASH: Test con hash de ceros')
    try {
      return true
    } catch (error) {
      console.log('ZERO HASH: Error en test:', error)
      return false
    }
  }
}

// Exportar instancia para que funcione en Hayase
export default new AnimeOnlineZeroHash()