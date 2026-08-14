import { useState, useMemo, useEffect, useCallback } from 'react';

const HIDDEN_COLUMNS_KEY = 'table-hidden-columns';

const useColumnVisibility = (columns = [], tableId = 'default') => {
    const storageKey = `${HIDDEN_COLUMNS_KEY}-${tableId}`;

    const getAllSelectableColumnKeys = useMemo(
        () => columns.filter(column => column.hideable !== false).map(column => column.key),
        [columns]
    );

    const getInitialHiddenColumns = () => {
        try {
            const saved = sessionStorage.getItem(storageKey);
            if (saved) {
                const savedHiddenColumns = JSON.parse(saved);
                return savedHiddenColumns.filter(key => getAllSelectableColumnKeys.includes(key));
            }
        } catch (error) {
            console.error('Error loading hidden columns:', error);
        }
        return [];
    };

    const [hiddenColumns, setHiddenColumns] = useState(getInitialHiddenColumns);

    useEffect(() => {
        try {
            sessionStorage.setItem(storageKey, JSON.stringify(hiddenColumns));
        } catch (error) {
            console.error('Error saving hidden columns:', error);
        }
    }, [hiddenColumns, storageKey]);

    useEffect(() => {
        const filteredHiddenColumns = hiddenColumns.filter(key =>
            getAllSelectableColumnKeys.includes(key)
        );
        if (filteredHiddenColumns.length !== hiddenColumns.length) {
            setHiddenColumns(filteredHiddenColumns);
        }
    }, [columns, getAllSelectableColumnKeys, hiddenColumns]);

    const visibleColumns = useMemo(
        () => getAllSelectableColumnKeys.filter(key => !hiddenColumns.includes(key)),
        [getAllSelectableColumnKeys, hiddenColumns]
    );

    const toggleColumn = useCallback((columnKey) => {
        setHiddenColumns(prev => {
            const isCurrentlyHidden = prev.includes(columnKey);
            const currentVisible = getAllSelectableColumnKeys.filter(k => !prev.includes(k));
            if (isCurrentlyHidden) {
                return prev.filter(key => key !== columnKey);
            }
            if (currentVisible.length === 1 && currentVisible[0] === columnKey) {
                return prev;
            }
            return [...prev, columnKey];
        });
    }, [getAllSelectableColumnKeys]);

    const showAllColumns = useCallback(() => setHiddenColumns([]), []);
    const hideAllColumns = useCallback(() => {
        setHiddenColumns(prev => {
            const toHide = [...getAllSelectableColumnKeys];
            if (toHide.length > 1) {
                toHide.shift();
                return toHide;
            }
            return prev;
        });
    }, [getAllSelectableColumnKeys]);

    const resetToDefault = useCallback(() => setHiddenColumns([]), []);

    const filteredColumns = useMemo(
        () => columns.filter(column =>
            column.hideable === false || visibleColumns.includes(column.key)
        ),
        [columns, visibleColumns]
    );

    return {
        visibleColumns,
        hiddenColumns,
        filteredColumns,
        toggleColumn,
        showAllColumns,
        hideAllColumns,
        resetToDefault,
        setHiddenColumns,
        getAllSelectableColumnKeys,
    };
};

export default useColumnVisibility;
