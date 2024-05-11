"use client";

import React, { useState } from 'react'
import MapSearchModal from './MapSearchModal';

export default function MapSearchButton({ googleMapsApiKey, onUpdate }: { googleMapsApiKey: string, onUpdate?: any }) {
    const [modalOpen, setModalOpen] = useState(false);

    const openModal = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    return (
        <>
            <button onClick={openModal}>Search Maps</button>
            <MapSearchModal googleMapsApiKey={googleMapsApiKey} isOpen={modalOpen} closeModal={closeModal} onUpdate={onUpdate} />
        </>
    )
}
