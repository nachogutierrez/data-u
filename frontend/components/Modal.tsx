"use client";

import React from 'react'

export default function Modal({ isOpen, closeModal, children }: { isOpen: boolean, closeModal: any, children: any }) {
    if (!isOpen) return null;

    // Function to stop event propagation
    const handleModalContentClick = (e: any) => {
        e.stopPropagation(); // Prevents click event from bubbling up to the modal backdrop
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
            onClick={closeModal}
            style={{ zIndex: '2000' }}>
            <div className="bg-white p-5 rounded-lg shadow-lg m-4"
                onClick={handleModalContentClick} style={{ minWidth: '300px', maxWidth: '90%' }}>
                {children}
            </div>
        </div>
    );
}
