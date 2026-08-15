import { useContext } from 'react';
import { DateContext } from './dateContext';

export const useDateContext = () => useContext(DateContext);
