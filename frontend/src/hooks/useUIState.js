import { useState, useCallback } from 'react'

const initialModalState = { open: false, data: null, mode: null }
const initialDialogState = { open: false, data: null, dialogueType: null }
const initialPreviewState = { open: false, imageUrl: '', title: '' }

export const useModalState = () => {
    const [state, setState] = useState(initialModalState)
    const openAdd = useCallback(() => setState({ open: true, data: null, mode: 'add' }), [])
    const openEdit = useCallback((data) => setState({ open: true, data, mode: 'edit' }), [])
    const openView = useCallback((data) => setState({ open: true, data, mode: 'view' }), [])
    const close = useCallback(() => setState(initialModalState), [])
    return { ...state, openAdd, openEdit, openView, close, setState }
}

export const useDialogState = () => {
    const [state, setState] = useState(initialDialogState)
    const show = useCallback((data, dialogueType) => setState({ open: true, data, dialogueType }), [])
    const close = useCallback(() => setState(prev => ({ ...prev, open: false })), [])
    return { ...state, show, close, setState }
}

export const usePreviewState = () => {
    const [state, setState] = useState(initialPreviewState)
    const show = useCallback((imageUrl, title) => setState({ open: true, imageUrl, title }), [])
    const close = useCallback(() => setState(initialPreviewState), [])
    return { ...state, show, close, setState }
}