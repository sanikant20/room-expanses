import React, { useState } from 'react';
import { DateContext } from './dateContext';

export const DateProvider = ({ children }) => {
    const [useNepaliDate, setUseNepaliDate] = useState(() => {
        // Get saved value from sessionStorage or default to false
        const stored = sessionStorage.getItem('useNepaliDate');
        return stored !== 'false';
    });

    const toggleDateMode = () => {
        setUseNepaliDate(prev => {
            const newVal = !prev;
            sessionStorage.setItem('useNepaliDate', newVal);
            return newVal;
        });
    };

    return (
        <DateContext.Provider value={{ useNepaliDate, toggleDateMode }}>
            {children}
        </DateContext.Provider>
    );
};
