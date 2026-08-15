import React from 'react';
import CustomTab from '../../../components/custom/CustomTab';
import { GroupWorkRounded, GroupsRounded } from '@mui/icons-material';
import PartnerList from './partnerData/PartnerList';
import GroupList from './groups/GroupList';

const PartnerTab = ({ initialTab = 0 }) => {
    const tabs = [
        {
            icon: <GroupWorkRounded />,
            label: 'Partners',
            content: <PartnerList />,
        },
        {
            icon: <GroupsRounded />,
            label: 'Partner Groups',
            content: <GroupList />,
        },
    ];

    return (
        <CustomTab tabs={tabs} initialValue={initialTab} storageKey="partnersActiveTab" />
    );
};

export default PartnerTab;
