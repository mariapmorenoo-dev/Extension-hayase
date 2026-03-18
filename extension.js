export async function search(request, query) {
  const url = `https://nyaa.si/?page=rss&q=${encodeURIComponent(query + " Spanish")}&c=1_2&f=0`;
  const xml = await request.text(url);

  const results = [];
  const items = xml.split("<item>").slice(1);

  for (const item of items) {
    const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/);
    const linkMatch = item.match(/<guid[^>]*>(.*?)<\/guid>/);
    const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);

    if (!titleMatch || !linkMatch) continue;

    results.push({
      title: titleMatch[1],
      url: linkMatch[1],
      time: pubDateMatch ? pubDateMatch[1] : ""
    });
  }

  return results;
}

export async function detail(request, url) {
  const html = await request.text(url);
  const magnetMatch = html.match(/href="(magnet:\?xt=urn:btih:[^"]+)"/);

  return {
    episodes: [
      {
        title: "Descargar",
        url: magnetMatch ? magnetMatch[1] : url
      }
    ]
  };
}

