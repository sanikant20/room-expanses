import React from 'react'
import CustomTab from '../../../components/custom/CustomTab'
import { AccountCircleTwoTone, KeyTwoTone, PaletteTwoTone } from '@mui/icons-material';
import ThemeColorSelection from '../../../theme/ThemeColorSelection';
import ChangePassword from './ChangePassword';
import Profile from './Profile';

const SettingTab = () => {
    const tabs = [
        { icon: <AccountCircleTwoTone />, label: 'Profile', content: <Profile /> },
        { icon: <KeyTwoTone />, label: 'Change Password', content: <ChangePassword /> },
        { icon: <PaletteTwoTone />, label: 'Theme', content: <ThemeColorSelection /> },
    ];

    return (
        <CustomTab tabs={tabs} storageKey="settingActiveTab" />
    )
}

export default SettingTab
