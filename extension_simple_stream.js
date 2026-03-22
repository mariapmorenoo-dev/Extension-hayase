class AnimeOnlineSimple {
  base = 'https://ver.animeonline.ninja'

  async single({ titles, episode }) {
    console.log('SIMPLE: single - ', titles?.[0], 'ep', episode)

    if (!titles?.length) return []

    return [
      {
        title: `${titles[0]} - Episodio ${episode || 1} [Latino]`,
        link: `https://ver.animeonline.ninja/ver/${titles[0]}-${episode || 1}`,
        date: new Date(),
        type: 'stream'
      }
    ]
  }

  async batch({ titles }) {
    console.log('SIMPLE: batch - ', titles?.[0])

    if (!titles?.length) return []

    const results = []
    for (let i = 1; i <= 10; i++) {
      results.push({
        title: `${titles[0]} - Episodio ${i} [Latino]`,
        link: `https://ver.animeonline.ninja/ver/${titles[0]}-${i}`,
        date: new Date(),
        type: 'stream'
      })
    }

    console.log('SIMPLE: batch results:', results.length)
    return results
  }

  async movie({ titles }) {
    console.log('SIMPLE: movie - ', titles?.[0])

    if (!titles?.length) return []

    return [
      {
        title: `${titles[0]} [Película Latino]`,
        link: `https://ver.animeonline.ninja/pelicula/${titles[0]}`,
        date: new Date(),
        type: 'stream'
      }
    ]
  }

  async test() {
    console.log('SIMPLE: test OK')
    return true
  }
}

export default new AnimeOnlineSimple()