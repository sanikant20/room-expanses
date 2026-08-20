import React from 'react';
import { LocalDrinkRounded, RiceBowlRounded, WaterDropRounded } from '@mui/icons-material';

export const TURN_TYPES = {
    water: {
        type: 'water',
        label: 'Water',
        title: 'Water Turn',
        noun: 'water',
        verb: 'brought water',
        action: 'I Brought Water',
        coverAction: 'I Brought Water For This Turn',
        due: 'Water due',
        mark: 'Mark Water Brought',
        markDesc: 'Record that a partner brought water. This fulfills that partner\'s obligation for the cycle. Use it only when they genuinely brought the water.',
        historyTitle: 'Water Turn History',
        icon: WaterDropRounded,
        cardIcon: <WaterDropRounded />,
        actionIcon: <LocalDrinkRounded />,
    },
    rice: {
        type: 'rice',
        label: 'Rice',
        title: 'Rice Turn',
        noun: 'rice',
        verb: 'brought rice',
        action: 'I Brought Rice',
        coverAction: 'I Brought Rice For This Turn',
        due: 'Rice due',
        mark: 'Mark Rice Brought',
        markDesc: 'Record that a partner brought rice. This fulfills that partner\'s obligation for the cycle. Use it only when they genuinely brought the rice.',
        historyTitle: 'Rice Turn History',
        icon: RiceBowlRounded,
        cardIcon: <RiceBowlRounded />,
        actionIcon: <RiceBowlRounded />,
    },
};

export const getTurnTypeConfig = (type) => TURN_TYPES[type] || TURN_TYPES.water;