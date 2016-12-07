import map from '../FloatEditor/emotions'

export default function(html) {
  // extra lines
  html = html.replace(/<br(.*?)>/gi, '\n')
  html = html.replace(/\n/g, '[br]')

  // quote & format
  html = html.replace(/<blockquote>/gi, '[quote]')
  html = html.replace(/<\/blockquote>/gi, '[/quote]')
  html = html.replace(/<strong>/gi, '[b]')
  html = html.replace(/<\/strong>/gi, '[/b]')
  html = html.replace(/<em>/gi, '[i]')
  html = html.replace(/<\/em>/gi, '[/i]')
  html = html.replace(/<del>/gi, '[s]')
  html = html.replace(/<\/del>/gi, '[/s]')
  html = html.replace(/<ins>/gi, '[u]')
  html = html.replace(/<\/ins>/gi, '[/u]')

  // list
  html = html.replace(/<ul(.*?)>/gi, '[list]')
  html = html.replace(/<li>(.*?)\n/gi, '[*]$1\n')
  html = html.replace(/<\/ul>/gi, '[/list]')

  // url
  html = html.replace(/<a(.*?)>(.*?)<\/a>/gi, '[url]$2[/url]')

  // color, font size
  const sizes = {
    'x-small': 1,
    'small': 2,
    'medium': 3,
    'large': 4,
    'x-large': 5,
    'xx-large': 6,
  }
  /* eslint no-cond-assign: 0 */
  const msg = document.createElement('div')
  msg.innerHTML = html
  let elem
  while(elem = msg.querySelector('span')) {
    const color = elem.style.color
    const fontSize = elem.style.fontSize
    if (color) {
      elem.outerHTML = `[${ color }]` + elem.innerHTML + `[/${ color }]`
    } else if (fontSize) {
      let size = 'size=' + sizes[fontSize]
      elem.outerHTML = `[${ size }]` + elem.innerHTML + `[/${ size }]`
    }
  }

  // align
  while(elem = msg.querySelector('div')) {
    const align = elem.style.textAlign
    if (align) {
      elem.outerHTML = `[${ align }]` + elem.innerHTML + `[/${ align }]`
    }
  }

  // image & icon
  while(elem = msg.querySelector('img')) {
    let src = elem.src
    if (src) {
      const iconIndex = src.indexOf('/assets/faces')
      if (iconIndex > 0) {
        elem.outerHTML = map[src.slice(iconIndex + '/assets/faces'.length)]
      } else {
        elem.outerHTML = `[img]` + src + `[/img]`
      }
    }
  }

  html = msg.innerText.replace(/\[br\]/g, '\n')
  return html
}

export { map }
