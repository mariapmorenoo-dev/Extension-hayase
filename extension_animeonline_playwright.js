import { chromium } from 'playwright'

export default class AnimeOnlineNinja {
  base = 'https://ver.animeonline.ninja'
  browserInstance = null

  async getBrowser() {
    if (!this.browserInstance) {
      this.browserInstance = await chromium.launch({
        headless: true, // Volver a true para compatibilidad con Hayase
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--ignore-certificate-errors',
          '--ignore-ssl-errors',
          '--ignore-certificate-errors-spki-list',
          '--memory-pressure-off',
          '--disable-blink-features=AutomationControlled',
          '--exclude-switches=enable-automation',
          '--disable-dev-tools'
        ]
      })
    }
    return this.browserInstance
  }

  async closeBrowser() {
    if (this.browserInstance) {
      await this.browserInstance.close()
      this.browserInstance = null
    }
  }

  async single({ titles, episode }) {
    if (!titles?.length) return []

    const title = titles[0]
    // Validar que episode sea un número válido
    const episodeNumber = episode && typeof episode === 'number' ? episode : 1
    const query = `${title} episodio ${episodeNumber} español latino doblado`

    try {
      const browser = await this.getBrowser()
      const page = await browser.newPage({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      })

      // Configurar headers realistas
      await page.setExtraHTTPHeaders({
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      })

      const searchUrl = `${this.base}/search?q=${encodeURIComponent(query)}`
      console.log(`Searching for: ${query}`)

      // Navegar y esperar que se cargue completamente
      await page.goto(searchUrl, { waitUntil: 'load', timeout: 10000 })

      // Esperar a que se resuelva cualquier desafío de Cloudflare
      await page.waitForTimeout(2000)

      // Extraer contenido de la página
      const searchResults = await this.parseSearchPagePlaywright(page, title)

      // Buscar resultados específicos del episodio
      const episodeResults = []

      for (const result of searchResults.slice(0, 3)) { // Limitar para evitar sobrecarga
        try {
          await this.delay(1000) // Rate limiting

          const episodeData = await this.getEpisodeDataPlaywright(page, result, episode)
          if (episodeData) {
            episodeResults.push(episodeData)
          }
        } catch (error) {
          console.error(`Error processing episode ${episode}:`, error)
        }
      }

      await page.close()
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
      const browser = await this.getBrowser()
      const page = await browser.newPage({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      })

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      })

      const searchUrl = `${this.base}/search?q=${encodeURIComponent(query)}`
      await page.goto(searchUrl, { waitUntil: 'load', timeout: 10000 })
      await page.waitForTimeout(2000)

      const searchResults = await this.parseSearchPagePlaywright(page, title)
      const batchResults = []

      for (const result of searchResults.slice(0, 2)) { // Limitar para evitar sobrecarga
        try {
          await this.delay(1000)

          const seriesData = await this.getSeriesDataPlaywright(page, result, title)
          batchResults.push(...seriesData.slice(0, 10)) // Primeros 10 episodios

        } catch (error) {
          console.error('Error processing series:', error)
        }
      }

      await page.close()
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
      const browser = await this.getBrowser()
      const page = await browser.newPage({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      })

      await page.setExtraHTTPHeaders({
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8'
      })

      const searchUrl = `${this.base}/search?q=${encodeURIComponent(query)}`
      await page.goto(searchUrl, { waitUntil: 'load', timeout: 10000 })
      await page.waitForTimeout(2000)

      const searchResults = await this.parseSearchPagePlaywright(page, title)
      const movieResults = []

      for (const result of searchResults.slice(0, 3)) {
        try {
          await this.delay(1000)

          const movieData = await this.getMovieDataPlaywright(page, result, title)
          if (movieData) {
            movieResults.push(movieData)
          }

        } catch (error) {
          console.error('Error processing movie:', error)
        }
      }

      await page.close()
      return movieResults

    } catch (error) {
      console.error('Error searching movies:', error)
      return []
    }
  }

  async parseSearchPagePlaywright(page, originalTitle) {
    const results = []

    try {
      // Buscar enlaces de anime en los resultados con múltiples selectores
      const animeLinks = await page.evaluate(() => {
        const links = []

        // Diferentes patrones de selectores que podrían usar
        const selectors = [
          'a[href*="/anime/"]',
          'a[href*="/ver/"]',
          'a[href*="/series/"]',
          '.anime-link',
          '.result-item a',
          '.search-result a'
        ]

        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector)
          elements.forEach(element => {
            const href = element.getAttribute('href')
            const title = element.textContent.trim() || element.title || element.getAttribute('alt')

            if (href && title) {
              links.push({
                href: href.startsWith('/') ? href : '/' + href,
                title: title
              })
            }
          })
        }

        return links
      })

      for (const linkData of animeLinks) {
        const fullUrl = linkData.href.startsWith('http') ? linkData.href : `${this.base}${linkData.href}`
        const title = linkData.title

        // Filtrar solo contenido que parezca ser español/latino y relevante
        if (this.isDubbedContent(title, linkData.href) && this.isTitleRelevant(title, originalTitle)) {
          results.push({
            title,
            link: fullUrl,
            slug: this.extractSlugFromUrl(linkData.href)
          })
        }
      }

    } catch (error) {
      console.error('Error parsing search page:', error)
    }

    return results
  }

  async getEpisodeDataPlaywright(page, result, episode) {
    try {
      await page.goto(result.link, { waitUntil: 'load', timeout: 8000 })
      await page.waitForTimeout(2000)

      // Buscar enlace específico del episodio
      const episodeUrl = await page.evaluate((ep) => {
        const episodeLinks = document.querySelectorAll('a[href*="/ver/"], a[href*="/episode/"], a[href*="/ep/"]')

        for (const link of episodeLinks) {
          const href = link.getAttribute('href')
          const text = link.textContent.trim()

          // Buscar coincidencia del número de episodio
          if (href && (href.includes(`-${ep}`) || href.includes(`-ep-${ep}`) || text.includes(`${ep}`))) {
            return href.startsWith('/') ? href : '/' + href
          }
        }

        return null
      }, episode)

      if (episodeUrl) {
        const fullEpisodeUrl = episodeUrl.startsWith('http') ? episodeUrl : `${this.base}${episodeUrl}`

        const videoUrls = await this.extractVideoUrlsPlaywright(page, fullEpisodeUrl)

        if (videoUrls.length > 0) {
          return this.createStreamingResult(
            `${result.title} - Episodio ${episodeNumber} [Español Latino]`,
            fullEpisodeUrl,
            videoUrls
          )
        }
      }

    } catch (error) {
      console.error(`Error getting episode data:`, error)
    }

    return null
  }

  async getSeriesDataPlaywright(page, result, seriesTitle) {
    const episodes = []

    try {
      await page.goto(result.link, { waitUntil: 'load', timeout: 8000 })
      await page.waitForTimeout(2000)

      // Extraer lista de episodios
      const episodesList = await page.evaluate(() => {
        const episodes = []
        const episodeLinks = document.querySelectorAll('a[href*="/ver/"], a[href*="/episode/"], a[href*="/ep/"]')

        episodeLinks.forEach((link, index) => {
          const href = link.getAttribute('href')
          const text = link.textContent.trim()

          if (href) {
            // Intentar extraer número de episodio del href o texto
            const epMatch = href.match(/(?:ep|episode|ver)[-_]?(\d+)/i) || text.match(/(?:episodio|ep)[\s\-_]*(\d+)/i)
            const number = epMatch ? parseInt(epMatch[1]) : index + 1

            episodes.push({
              number,
              url: href.startsWith('/') ? href : '/' + href,
              title: text
            })
          }
        })

        return episodes
      })

      // Procesar algunos episodios
      for (const episodeInfo of episodesList.slice(0, 5)) { // Limitar a 5 episodios por rendimiento
        try {
          await this.delay(800)

          const fullEpisodeUrl = episodeInfo.url.startsWith('http') ? episodeInfo.url : `${this.base}${episodeInfo.url}`
          const videoUrls = await this.extractVideoUrlsPlaywright(page, fullEpisodeUrl)

          if (videoUrls.length > 0) {
            episodes.push(this.createStreamingResult(
              `${seriesTitle} - Episodio ${episodeInfo.number} [Español Latino]`,
              fullEpisodeUrl,
              videoUrls
            ))
          }

        } catch (error) {
          console.error(`Error processing episode ${episodeInfo.number}:`, error)
        }
      }

    } catch (error) {
      console.error('Error getting series data:', error)
    }

    return episodes
  }

  async getMovieDataPlaywright(page, result, movieTitle) {
    try {
      await page.goto(result.link, { waitUntil: 'load', timeout: 8000 })
      await page.waitForTimeout(2000)

      const videoUrls = await this.extractVideoUrlsPlaywright(page, result.link)

      if (videoUrls.length > 0) {
        return this.createStreamingResult(
          `${movieTitle} [Película Español Latino]`,
          result.link,
          videoUrls
        )
      }

    } catch (error) {
      console.error('Error getting movie data:', error)
    }

    return null
  }

  async extractVideoUrlsPlaywright(page, episodeUrl) {
    const videoUrls = []

    try {
      await page.goto(episodeUrl, { waitUntil: 'networkidle' })
      await page.waitForTimeout(3000)

      // Extraer URLs de video con múltiples estrategias
      const extractedUrls = await page.evaluate(() => {
        const urls = []

        // Buscar iframes de reproductores
        const iframes = document.querySelectorAll('iframe[src]')
        iframes.forEach(iframe => {
          const src = iframe.getAttribute('src')
          if (src && (src.includes('embed') || src.includes('player'))) {
            urls.push({ url: src, type: 'iframe', quality: 'unknown' })
          }
        })

        // Buscar enlaces directos de video
        const videoLinks = document.querySelectorAll('a[href*=".mp4"], a[href*=".m3u8"], a[href*="video"]')
        videoLinks.forEach(link => {
          const href = link.getAttribute('href')
          if (href) {
            urls.push({ url: href, type: 'direct', quality: 'unknown' })
          }
        })

        // Buscar en scripts por configuraciones de reproductores
        const scripts = document.querySelectorAll('script')
        scripts.forEach(script => {
          const content = script.textContent || script.innerHTML

          // Buscar URLs de video en configuraciones JavaScript
          const mp4Matches = content.match(/(?:file|src|source)["']?\s*:\s*["']([^"']+\.mp4[^"']*)/gi)
          const m3u8Matches = content.match(/(?:file|src|source)["']?\s*:\s*["']([^"']+\.m3u8[^"']*)/gi)

          if (mp4Matches) {
            mp4Matches.forEach(match => {
              const urlMatch = match.match(/["']([^"']+)["']/)
              if (urlMatch) {
                urls.push({ url: urlMatch[1], type: 'mp4', quality: 'unknown' })
              }
            })
          }

          if (m3u8Matches) {
            m3u8Matches.forEach(match => {
              const urlMatch = match.match(/["']([^"']+)["']/)
              if (urlMatch) {
                urls.push({ url: urlMatch[1], type: 'hls', quality: 'unknown' })
              }
            })
          }
        })

        return urls
      })

      // Procesar URLs extraídas
      for (const urlData of extractedUrls) {
        let finalUrl = urlData.url

        // Si es un embed, intentar extraer la URL real
        if (urlData.type === 'iframe') {
          finalUrl = await this.resolveEmbedUrl(page, urlData.url)
        }

        if (finalUrl && this.isValidVideoUrl(finalUrl)) {
          videoUrls.push({
            url: finalUrl,
            quality: this.detectQuality(finalUrl),
            type: this.detectVideoType(finalUrl)
          })
        }
      }

    } catch (error) {
      console.error('Error extracting video URLs:', error)
    }

    return videoUrls
  }

  async resolveEmbedUrl(page, embedUrl) {
    try {
      await page.goto(embedUrl, { waitUntil: 'networkidle', timeout: 10000 })
      await page.waitForTimeout(2000)

      // Buscar URL de video en el embed
      const videoUrl = await page.evaluate(() => {
        // Buscar elementos de video
        const videos = document.querySelectorAll('video[src], video source[src]')
        for (const video of videos) {
          const src = video.getAttribute('src')
          if (src) return src
        }

        // Buscar en scripts del embed
        const scripts = document.querySelectorAll('script')
        for (const script of scripts) {
          const content = script.textContent || script.innerHTML
          const mp4Match = content.match(/(?:file|src|source)["']?\s*:\s*["']([^"']+\.mp4[^"']*)/i)
          const m3u8Match = content.match(/(?:file|src|source)["']?\s*:\s*["']([^"']+\.m3u8[^"']*)/i)

          if (mp4Match) return mp4Match[1]
          if (m3u8Match) return m3u8Match[1]
        }

        return null
      })

      return videoUrl

    } catch (error) {
      console.error('Error resolving embed URL:', error)
      return null
    }
  }

  isValidVideoUrl(url) {
    return url && (
      url.includes('.mp4') ||
      url.includes('.m3u8') ||
      url.includes('video') ||
      url.includes('stream')
    )
  }

  isDubbedContent(title, link) {
    const dubbedKeywords = ['latino', 'español', 'doblado', 'castellano', 'espanol']
    const content = (title + ' ' + link).toLowerCase()
    return dubbedKeywords.some(keyword => content.includes(keyword))
  }

  isTitleRelevant(title, originalTitle) {
    const titleLower = title.toLowerCase()
    const originalLower = originalTitle.toLowerCase()

    // Buscar coincidencias parciales
    const words = originalLower.split(' ')
    return words.some(word => word.length > 2 && titleLower.includes(word))
  }

  extractSlugFromUrl(url) {
    const match = url.match(/\/(?:anime|ver|series)\/([^\/]+)/)
    return match ? match[1] : ''
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
    return 'stream'
  }

  createStreamingResult(title, pageUrl, videoUrls) {
    const primaryVideo = videoUrls[0] || {}

    return {
      title,
      link: pageUrl,
      videoUrl: primaryVideo.url || pageUrl,
      hash: null,
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
      // Test simplificado para Hayase
      const browser = await this.getBrowser()
      const page = await browser.newPage({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      })

      console.log('Testing connectivity...')

      await page.goto(`${this.base}/`, {
        waitUntil: 'load',
        timeout: 8000
      })

      await page.waitForTimeout(3000)

      const title = await page.title()
      const isWorking = title && title.length > 0

      await page.close()

      console.log('Test result:', isWorking ? 'OK' : 'FAILED')

      return isWorking

    } catch (error) {
      console.error('Test failed:', error.message)
      return false
    }
  }

  async cleanup() {
    await this.closeBrowser()
  }
}