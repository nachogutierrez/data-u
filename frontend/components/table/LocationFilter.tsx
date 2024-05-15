"use client";

import React, { useEffect, useState } from 'react'
import MapSearchModal from '../maps/MapSearchModal';
import { useSearchParams } from 'next/navigation';

type LocationFilterProps = {
  googleMapsApiKey: string,
  changeQueryParams?: any,
  isTransitionPending?: boolean
}

export default function LocationFilter(props: LocationFilterProps) {

  const { googleMapsApiKey, changeQueryParams } = props

  const [modalOpen, setModalOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState('')
  const searchParams = useSearchParams()

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  useEffect(() => {
    const initialLocationQueryBase64 = searchParams.get('q') || ''

    if (initialLocationQueryBase64) {
      const decoded = atob(initialLocationQueryBase64)
      setLocationQuery(decoded)
      changeQueryParams({ q: initialLocationQueryBase64 })
    }
  }, [])

  function handleLocationUpdate(value: any) {
    const { name, area }: { name: string, area: number } = value
    const safeName = name
      .replaceAll('á', 'a')
      .replaceAll('é', 'e')
      .replaceAll('í', 'i')
      .replaceAll('ó', 'o')
      .replaceAll('ú', 'u')
      .replaceAll('Á', 'A')
      .replaceAll('É', 'E')
      .replaceAll('Í', 'I')
      .replaceAll('Ó', 'O')
      .replaceAll('Ú', 'U')
    setLocationQuery(safeName)
    changeQueryParams({ q: btoa(safeName) })
  }

  function cropString(s: string, maxLength: number) {
    if (s.length > maxLength) {
      return `${s.slice(0, maxLength)}...`
    }
    return s
  }

  return (
    <div>
      <div
        className="p-2 bg-white rounded-md m-0 hover:bg-gray-200 transition-all duration-200 ease-in-out cursor-pointer border-black select-none flex"
        style={{ borderWidth: '1px' }}>
        <div onClick={openModal} className="flex flex-col items-center w-48">
          <p>Location</p>
          {locationQuery && (
            <p className="text-xs">{cropString(locationQuery, 24)}</p>
          )}
        </div>
        <MapSearchModal
          googleMapsApiKey={googleMapsApiKey}
          isOpen={modalOpen}
          closeModal={closeModal}
          onUpdate={handleLocationUpdate} />
      </div>
    </div>
  )
}
