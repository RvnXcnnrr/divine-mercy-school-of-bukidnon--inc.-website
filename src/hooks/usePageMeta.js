import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const SITE_NAME = 'Divine Mercy School of Bukidnon, Inc.'

function ensureMeta(name) {
  let tag = document.querySelector(`meta[name="${name}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('name', name)
    document.head.appendChild(tag)
  }
  return tag
}

function ensureProperty(property) {
  let tag = document.querySelector(`meta[property="${property}"]`)
  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute('property', property)
    document.head.appendChild(tag)
  }
  return tag
}

function ensureCanonical() {
  let link = document.querySelector('link[rel="canonical"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  return link
}

export default function usePageMeta({ title, description } = {}) {
  const { pathname } = useLocation()

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    document.title = fullTitle

    if (description) {
      ensureMeta('description').setAttribute('content', description)
      ensureProperty('og:description').setAttribute('content', description)
    }

    ensureProperty('og:site_name').setAttribute('content', SITE_NAME)
    ensureProperty('og:type').setAttribute('content', 'website')
    ensureProperty('og:title').setAttribute('content', fullTitle)

    try {
      const canonical = ensureCanonical()
      canonical.setAttribute('href', `${window.location.origin}${pathname}`)
      ensureProperty('og:url').setAttribute('content', `${window.location.origin}${pathname}`)
    } catch {
      // noop (e.g., non-browser environments)
    }
  }, [title, description, pathname])
}
