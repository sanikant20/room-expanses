import React from 'react';
import CustomTab from '../../../components/custom/CustomTab';
import { WaterDropRounded } from '@mui/icons-material';
import WaterTurn from './water/WaterTurn';

const TurnTabs = ({ initialTab = 0 }) => {
    const tabs = [
        {
            icon: <WaterDropRounded />,
            label: 'Water Turn',
            content: <WaterTurn />,
        },
    ];

    return (
        <CustomTab tabs={tabs} initialValue={initialTab} storageKey="turnActiveTab" />
    );
};

export default TurnTabs;