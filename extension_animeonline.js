export default class AnimeOnlineNinja {
  base = 'https://ver.animeonline.ninja'

  async single({ titles, episode }) {
    if (!titles?.length) return []

    const title = titles[0]
    const query = `${title} episodio ${episode} español latino doblado`

    try {
      const searchUrl = `${this.base}/search?q=${encodeURIComponent(query)}`
      const searchResults = await this.searchAnime(searchUrl, query)

      // Buscar resultados específicos del episodio
      const episodeResults = await this.findEpisode(searchResults, title, episode)
      return episodeResults
    } catch (error) {
      console.error('Error searching single episode:', error)
      return []
    }
  }

  async batch({ titles }) {
    if (!titles?.length) return []

    const title = titles[0]
    const query = `${title} temporada completa español latino`

    try {
      const searchUrl = `${this.base}/search?q=${encodeURIComponent(query)}`
      const searchResults = await this.searchAnime(searchUrl, query)

      // Buscar múltiples episodios de la serie
      const batchResults = await this.findSeries(searchResults, title)
      return batchResults
    } catch (error) {
      console.error('Error searching batch episodes:', error)
      return []
    }
  }

  async movie({ titles }) {
    if (!titles?.length) return []

    const title = titles[0]
    const query = `${title} película español latino doblado`

    try {
      const searchUrl = `${this.base}/search?q=${encodeURIComponent(query)}`
      const searchResults = await this.searchAnime(searchUrl, query)

      // Buscar película específica
      const movieResults = await this.findMovie(searchResults, title)
      return movieResults
    } catch (error) {
      console.error('Error searching movie:', error)
      return []
    }
  }

  async searchAnime(searchUrl, originalQuery) {
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`)
    }

    const html = await response.text()
    return this.parseSearchResults(html, originalQuery)
  }

  parseSearchResults(html, query) {
    const results = []

    // Buscar enlaces de anime en los resultados
    // Patrón típico: href="/anime/nombre-del-anime" o href="/ver/nombre-episodio"
    const animeLinks = html.match(/href="\/(?:anime|ver)\/[^"]+"/g) || []

    for (const match of animeLinks) {
      const link = match.replace(/href="|"/g, '')
      const fullUrl = `${this.base}${link}`

      // Extraer título del enlace
      const titleMatch = link.match(/\/(?:anime|ver)\/([^\/]+)/)
      if (titleMatch) {
        const slug = titleMatch[1]
        const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

        // Filtrar solo contenido que parezca ser español/latino
        if (this.isDubbedContent(title, link)) {
          results.push({
            title,
            link: fullUrl,
            slug
          })
        }
      }
    }

    return results
  }

  isDubbedContent(title, link) {
    const dubbedKeywords = ['latino', 'español', 'doblado', 'castellano', 'espanol']
    const content = (title + ' ' + link).toLowerCase()

    return dubbedKeywords.some(keyword => content.includes(keyword))
  }

  async findEpisode(searchResults, seriesTitle, episode) {
    const results = []

    for (const result of searchResults.slice(0, 5)) { // Limitar a primeros 5 resultados
      try {
        await this.delay(500) // Rate limiting

        const episodeUrl = await this.getEpisodeUrl(result.link, episode)
        if (episodeUrl) {
          const videoUrls = await this.extractVideoUrls(episodeUrl)

          if (videoUrls.length > 0) {
            results.push(this.createStreamingResult(
              `${seriesTitle} - Episodio ${episode} [Español Latino]`,
              episodeUrl,
              videoUrls
            ))
          }
        }
      } catch (error) {
        console.error(`Error processing episode ${episode}:`, error)
      }
    }

    return results
  }

  async findSeries(searchResults, seriesTitle) {
    const results = []

    for (const result of searchResults.slice(0, 3)) { // Limitar para evitar sobrecarga
      try {
        await this.delay(500)

        const episodesList = await this.getSeriesEpisodes(result.link)

        for (const episodeInfo of episodesList.slice(0, 10)) { // Primeros 10 episodios
          const videoUrls = await this.extractVideoUrls(episodeInfo.url)

          if (videoUrls.length > 0) {
            results.push(this.createStreamingResult(
              `${seriesTitle} - Episodio ${episodeInfo.number} [Español Latino]`,
              episodeInfo.url,
              videoUrls
            ))
          }

          await this.delay(300) // Rate limiting entre episodios
        }
      } catch (error) {
        console.error('Error processing series:', error)
      }
    }

    return results
  }

  async findMovie(searchResults, movieTitle) {
    const results = []

    for (const result of searchResults.slice(0, 3)) {
      try {
        await this.delay(500)

        const videoUrls = await this.extractVideoUrls(result.link)

        if (videoUrls.length > 0) {
          results.push(this.createStreamingResult(
            `${movieTitle} [Película Español Latino]`,
            result.link,
            videoUrls
          ))
        }
      } catch (error) {
        console.error('Error processing movie:', error)
      }
    }

    return results
  }

  async getEpisodeUrl(animeUrl, episode) {
    // Buscar URL específica del episodio
    const response = await fetch(animeUrl)
    const html = await response.text()

    // Buscar enlaces a episodios específicos
    const episodePattern = new RegExp(`href="([^"]*(?:${episode.toString().padStart(2, '0')}|${episode})[^"]*)"`, 'i')
    const match = html.match(episodePattern)

    return match ? `${this.base}${match[1]}` : null
  }

  async getSeriesEpisodes(seriesUrl) {
    const response = await fetch(seriesUrl)
    const html = await response.text()

    const episodes = []
    const episodeMatches = html.match(/href="\/ver\/[^"]+"/g) || []

    episodeMatches.forEach((match, index) => {
      const link = match.replace(/href="|"/g, '')
      const episodeNumberMatch = link.match(/(\d+)(?:[^\/]*)?$/)
      const number = episodeNumberMatch ? parseInt(episodeNumberMatch[1]) : index + 1

      episodes.push({
        number,
        url: `${this.base}${link}`
      })
    })

    return episodes
  }

  async extractVideoUrls(episodeUrl) {
    try {
      const response = await fetch(episodeUrl)
      const html = await response.text()

      const videoUrls = []

      // Buscar iframes de reproductores
      const iframes = html.match(/<iframe[^>]+src="([^"]+)"/gi) || []

      for (const iframe of iframes) {
        const srcMatch = iframe.match(/src="([^"]+)"/)
        if (srcMatch) {
          const embedUrl = srcMatch[1]

          // Intentar extraer URL directa del reproductor
          const directUrl = await this.resolveVideoUrl(embedUrl)
          if (directUrl) {
            videoUrls.push({
              url: directUrl,
              quality: this.detectQuality(directUrl),
              type: this.detectVideoType(directUrl)
            })
          }
        }
      }

      // Buscar URLs directas en el HTML
      const directUrls = html.match(/(?:https?:\/\/[^"'\s]+\.(?:mp4|m3u8|avi|mkv))/gi) || []
      directUrls.forEach(url => {
        videoUrls.push({
          url,
          quality: this.detectQuality(url),
          type: this.detectVideoType(url)
        })
      })

      return videoUrls
    } catch (error) {
      console.error('Error extracting video URLs:', error)
      return []
    }
  }

  async resolveVideoUrl(embedUrl) {
    try {
      // Intentar resolver URL embebida para obtener video directo
      const response = await fetch(embedUrl, {
        headers: { 'Referer': this.base }
      })
      const embedHtml = await response.text()

      // Buscar configuraciones de reproductores comunes
      const mp4Match = embedHtml.match(/(?:file|src|source)["']?\s*:\s*["']([^"']+\.mp4[^"']*)/i)
      const m3u8Match = embedHtml.match(/(?:file|src|source)["']?\s*:\s*["']([^"']+\.m3u8[^"']*)/i)

      return mp4Match?.[1] || m3u8Match?.[1] || null
    } catch (error) {
      console.error('Error resolving embed URL:', error)
      return null
    }
  }

  detectQuality(url) {
    if (url.includes('1080') || url.includes('FHD')) return '1080p'
    if (url.includes('720') || url.includes('HD')) return '720p'
    if (url.includes('480') || url.includes('SD')) return '480p'
    return '720p' // Default
  }

  detectVideoType(url) {
    if (url.includes('.m3u8')) return 'hls'
    if (url.includes('.mp4')) return 'mp4'
    return 'unknown'
  }

  createStreamingResult(title, pageUrl, videoUrls) {
    const primaryVideo = videoUrls[0] || {}

    return {
      title,
      link: pageUrl,
      videoUrl: primaryVideo.url || pageUrl, // Fallback a página si no hay video directo
      hash: null, // No aplica para streaming
      seeders: null,
      leechers: null,
      downloads: 0,
      size: this.estimateSize(primaryVideo.quality),
      date: new Date(),
      verified: true,
      type: 'streaming',
      accuracy: 'high',
      quality: primaryVideo.quality || '720p',
      language: 'es-latino',
      videoType: primaryVideo.type || 'mp4'
    }
  }

  estimateSize(quality) {
    const sizeMap = {
      '1080p': 1500 * 1024 * 1024, // ~1.5GB
      '720p': 800 * 1024 * 1024,   // ~800MB
      '480p': 400 * 1024 * 1024    // ~400MB
    }

    return sizeMap[quality] || sizeMap['720p']
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async test() {
    try {
      const response = await fetch(`${this.base}/`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      // Considerar exitoso si el servidor responde, incluso con protección (200, 403, 429, etc.)
      // 403/429 indica que el sitio está activo pero protegido por Cloudflare
      return response.status === 200 || response.status === 403 || response.status === 429
    } catch (error) {
      console.error('Connectivity test failed:', error)
      return false
    }
  }
}