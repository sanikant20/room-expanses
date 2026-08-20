import React from 'react';
import CustomTab from '../../../components/custom/CustomTab';
import { CleaningServicesRounded, RiceBowlRounded, WaterDropRounded } from '@mui/icons-material';
import TurnView from './water/TurnView';

const TurnTabs = ({ initialTab = 0 }) => {
    const tabs = [
        {
            icon: <WaterDropRounded />,
            label: 'Water Turn',
            content: <TurnView type="water" />,
        },
        {
            icon: <CleaningServicesRounded />,
            label: 'Cleaning Turn',
            content: <TurnView type="cleaning" />,
        },
        {
            icon: <RiceBowlRounded />,
            label: 'Rice Turn',
            content: <TurnView type="rice" />,
        },

    ];

    return (
        <CustomTab tabs={tabs} initialValue={initialTab} storageKey="turnActiveTab" />
    );
};

export default TurnTabs;