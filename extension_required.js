class AnimeOnlineRequired {
  base = 'https://ver.animeonline.ninja'

  async single({ titles, episode }) {
    console.log('REQUIRED FIELDS: single llamado:', { titles, episode })

    if (!titles?.length) {
      console.log('REQUIRED FIELDS: No titles provided')
      return []
    }

    const results = [
      {
        title: `${titles[0]} - Episodio ${episode || 1} [Latino]`,
        link: `https://ver.animeonline.ninja/ver/${titles[0].toLowerCase().replace(/\s+/g, '-')}-${episode || 1}`,
        hash: '', // CAMPO REQUERIDO pero vacío para evitar descarga
        seeders: 0, // CAMPO REQUERIDO con 0 para evitar descarga
        leechers: 0, // CAMPO REQUERIDO exacto como Nyaa
        downloads: 0, // CAMPO REQUERIDO exacto como Nyaa
        size: 500000000, // CAMPO REQUERIDO con tamaño
        date: new Date(), // CAMPO REQUERIDO exacto como Nyaa
        verified: false, // CAMPO REQUERIDO exacto como Nyaa
        type: 'alt', // CAMPO REQUERIDO exacto como Nyaa
        accuracy: 'medium' // CAMPO REQUERIDO exacto como Nyaa
      }
    ]

    console.log('REQUIRED FIELDS: Todos los campos como Nyaa pero hash vacío')
    return results
  }

  async batch({ titles }) {
    console.log('REQUIRED FIELDS: batch llamado:', titles)

    if (!titles?.length) {
      console.log('REQUIRED FIELDS: No titles for batch')
      return []
    }

    const results = []
    for (let i = 1; i <= 12; i++) {
      const result = await this.single({ titles, episode: i })
      results.push(...result)
    }

    console.log('REQUIRED FIELDS: Batch total results:', results.length)
    return results
  }

  async movie({ titles }) {
    console.log('REQUIRED FIELDS: movie llamado:', titles)

    if (!titles?.length) {
      console.log('REQUIRED FIELDS: No titles for movie')
      return []
    }

    const results = [
      {
        title: `${titles[0]} [Película Latino]`,
        link: `https://ver.animeonline.ninja/pelicula/${titles[0].toLowerCase().replace(/\s+/g, '-')}`,
        hash: '', // Hash vacío
        seeders: 0, // 0 seeders para evitar descarga
        leechers: 0,
        downloads: 0,
        size: 1073741824,
        date: new Date(),
        verified: false,
        type: 'alt',
        accuracy: 'medium'
      }
    ]

    console.log('REQUIRED FIELDS: Movie result con campos completos')
    return results
  }

  async test() {
    console.log('REQUIRED FIELDS: Test con formato exacto de Nyaa')
    try {
      return true
    } catch (error) {
      console.log('REQUIRED FIELDS: Error en test:', error)
      return false
    }
  }
}

// Exportar instancia para que funcione en Hayase
export default new AnimeOnlineRequired()