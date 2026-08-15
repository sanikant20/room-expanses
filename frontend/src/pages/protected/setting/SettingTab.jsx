import React from 'react'
import CustomTab from '../../../components/custom/CustomTab'
import { AccountCircleTwoTone, CalendarMonthTwoTone, KeyTwoTone, PaletteTwoTone, TranslateTwoTone } from '@mui/icons-material';
import ThemeColorSelection from '../../../theme/ThemeColorSelection';
import ChangePassword from './ChangePassword';
import Profile from './Profile';
import DateFormatSettings from './DateFormatSettings';
import LanguageSettings from './LanguageSettings';
import { useTranslation } from 'react-i18next';

const SettingTab = () => {
    const { t } = useTranslation();

    const tabs = [
        { icon: <AccountCircleTwoTone />, label: t('settings.profile', 'Profile'), content: <Profile /> },
        { icon: <KeyTwoTone />, label: t('settings.changePassword', 'Change Password'), content: <ChangePassword /> },
        { icon: <PaletteTwoTone />, label: t('settings.theme', 'Theme'), content: <ThemeColorSelection /> },
        { icon: <CalendarMonthTwoTone />, label: t('settings.dateFormat', 'Date Format'), content: <DateFormatSettings /> },
        { icon: <TranslateTwoTone />, label: t('settings.language', 'Language'), content: <LanguageSettings /> },
    ];

    return (
        <CustomTab tabs={tabs} storageKey="settingActiveTab" />
    )
}

export default SettingTab
