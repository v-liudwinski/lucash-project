import { Fragment, useEffect, useMemo, useRef } from 'react'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, ZoomControl, useMap, useMapEvents } from 'react-leaflet'
import L, { type LatLngTuple } from 'leaflet'
import type { Book, Episode, Place } from '../types'

interface Props {
  book: Book
  activeIndex: number | null
  /** Індекси епізодів, що проходять фільтри */
  visible: Set<number>
  filtering: boolean
  journeyFilter: number | null
  onPickPlace: (placeId: string) => void
}

const ll = (p: Place): LatLngTuple => [p.lat, p.lng]

/** Наближає мапу до активного місця з урахуванням картки, що перекриває частину мапи */
function Camera({ target, bounds }: { target: Place | null; bounds: L.LatLngBounds }) {
  const map = useMap()
  const first = useRef(true)

  useEffect(() => {
    // Перший показ — без анімації, щоб не конфліктувати з початковим розміщенням мапи
    const size = map.getSize()
    // Прихована або ще не розміщена мапа: анімація дала б NaN-координати
    const animate = !first.current && size.x > 0 && size.y > 0
    first.current = false
    const container = map.getContainer().getBoundingClientRect()
    const card = map.getContainer().parentElement?.querySelector('.floating-card')?.getBoundingClientRect()

    // Яку частину мапи перекриває картка: справа (десктоп) чи знизу (мобільний)
    let padRight = 0
    let padBottom = 0
    if (card) {
      if (card.width < container.width * 0.75) padRight = container.right - card.left
      else padBottom = container.bottom - card.top
    }

    if (target) {
      const zoom = target.zoom ?? 9
      const point = map.project(ll(target), zoom).add([padRight / 2, padBottom / 2])
      if (animate) map.flyTo(map.unproject(point, zoom), zoom, { duration: 1.1, easeLinearity: 0.2 })
      else map.setView(map.unproject(point, zoom), zoom, { animate: false })
    } else {
      const opts = {
        paddingTopLeft: [40, 70] as [number, number],
        paddingBottomRight: [Math.min(padRight + 30, size.x - 100), Math.min(padBottom + 30, size.y - 100)] as [number, number],
      }
      if (animate) map.flyToBounds(bounds, { ...opts, duration: 1.1 })
      else map.fitBounds(bounds, { ...opts, animate: false })
    }
  }, [map, target, bounds])

  return null
}

/** Позначає мапу класом is-far на дальньому зумі, щоб ховати дрібні підписи */
function ZoomClass() {
  const map = useMapEvents({
    zoomend: () => apply(),
  })
  const apply = () => {
    map.getContainer().classList.toggle('is-far', map.getZoom() < 7.5)
  }
  useEffect(apply)
  return null
}

function pinIcon(opts: { number: number; color: string; count: number; state: string }) {
  const badge = opts.count > 1 ? `<i class="pin__count">${opts.count}</i>` : ''
  return L.divIcon({
    className: 'pin-wrap',
    html: `<div class="pin ${opts.state}" style="--c:${opts.color}"><span>${opts.number}</span>${badge}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    tooltipAnchor: [14, 0],
  })
}

export default function PlotMap({ book, activeIndex, visible, filtering, journeyFilter, onPickPlace }: Props) {
  const placeById = useMemo(() => new Map(book.places.map((p) => [p.id, p])), [book])
  const journeyColor = useMemo(() => new Map(book.journeys.map((j) => [j.id, j.color])), [book])

  // Епізоди, згруповані за місцем
  const byPlace = useMemo(() => {
    const m = new Map<string, { ep: Episode; index: number }[]>()
    book.episodes.forEach((ep, index) => {
      const list = m.get(ep.place) ?? []
      list.push({ ep, index })
      m.set(ep.place, list)
    })
    return m
  }, [book])

  // Маршрути виїздів як послідовність точок
  const routes = useMemo(
    () =>
      book.journeys.map((j) => {
        const pts: { index: number; pos: LatLngTuple }[] = []
        book.episodes.forEach((ep, index) => {
          if (ep.journey !== j.id) return
          const prev = pts[pts.length - 1]
          const place = placeById.get(ep.place)!
          if (prev && prev.pos[0] === place.lat && prev.pos[1] === place.lng) return
          pts.push({ index, pos: ll(place) })
        })
        // Повернення додому після останнього розділу виїзду
        const end = j.endPlace && placeById.get(j.endPlace)
        const last = pts[pts.length - 1]
        if (end && last && (last.pos[0] !== end.lat || last.pos[1] !== end.lng)) {
          pts.push({ index: last.index + 0.5, pos: ll(end) })
        }
        return { journey: j, pts }
      }),
    [book, placeById],
  )

  const active = activeIndex !== null ? book.episodes[activeIndex] : null
  const activePlace = active ? placeById.get(active.place)! : null

  const bounds = useMemo(() => {
    const idx = filtering && visible.size ? [...visible] : book.episodes.map((_, i) => i)
    return L.latLngBounds(idx.map((i) => ll(placeById.get(book.episodes[i].place)!)))
  }, [book, placeById, visible, filtering])

  return (
    <MapContainer
      className="plot-map"
      bounds={L.latLngBounds(book.places.map(ll))}
      zoomControl={false}
      minZoom={5}
      maxZoom={13}
      zoomSnap={0.25}
      worldCopyJump={false}
    >
      <TileLayer
        attribution="Тайли &copy; Esri — Esri, USGS, NOAA"
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}"
        maxNativeZoom={12}
      />
      <ZoomControl position="bottomleft" zoomInTitle="Наблизити" zoomOutTitle="Віддалити" />
      <Camera target={activePlace} bounds={bounds} />
      <ZoomClass />

      {routes.map(({ journey, pts }) => {
        const dim = journeyFilter !== null && journeyFilter !== journey.id
        const traveled = activeIndex === null ? pts : pts.filter((p) => p.index <= activeIndex)
        const all = pts.map((p) => p.pos)
        return (
          <Fragment key={journey.id}>
            <Polyline
              positions={all}
              pathOptions={{
                color: journey.color,
                weight: 2,
                opacity: dim ? 0.12 : 0.45,
                dashArray: '2 7',
                lineCap: 'round',
              }}
            />
            {traveled.length > 1 && (
              <Polyline
                positions={traveled.map((p) => p.pos)}
                pathOptions={{
                  color: journey.color,
                  weight: dim ? 2 : 3.5,
                  opacity: dim ? 0.15 : 0.9,
                  lineCap: 'round',
                  lineJoin: 'round',
                  className: 'route-line',
                }}
              />
            )}
          </Fragment>
        )
      })}

      {book.places.map((place) => {
        const eps = byPlace.get(place.id)
        if (!eps) return null
        const shown = eps.filter((e) => visible.has(e.index))
        const isActive = activePlace?.id === place.id
        const display =
          (isActive && eps.find((e) => e.index === activeIndex)) ||
          shown.find((e) => activeIndex === null || e.index >= activeIndex) ||
          shown[0] ||
          eps[0]
        const visited = activeIndex !== null && eps.some((e) => e.index <= activeIndex)
        const state = [
          isActive && 'is-active',
          visited && !isActive && 'is-visited',
          filtering && shown.length === 0 && 'is-dim',
          activeIndex !== null && !visited && 'is-future',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <Marker
            key={place.id}
            position={ll(place)}
            icon={pinIcon({
              number: display.index + 1,
              color: journeyColor.get(display.ep.journey)!,
              count: (filtering ? shown : eps).length,
              state,
            })}
            zIndexOffset={isActive ? 1000 : place.major ? 100 : 0}
            eventHandlers={{ click: () => onPickPlace(place.id) }}
          >
            <Tooltip
              permanent={place.major}
              direction="right"
              className={['place-label', place.major && 'place-label--major', place.always && 'place-label--always'].filter(Boolean).join(' ')}
            >
              {place.name}
            </Tooltip>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
