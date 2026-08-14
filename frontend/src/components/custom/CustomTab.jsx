import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab, Box, useTheme, useMediaQuery } from '@mui/material';

const CustomTabPanel = ({ children, value, index }) =>
    value === index ? (
        <Box
            role="tabpanel"
            id={`custom-tabpanel-${index}`}
            aria-labelledby={`custom-tab-${index}`}
            sx={{ p: 0, pt: 2, fontSize: 13 }}
        >
            {children}
        </Box>
    ) : null;

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    value: PropTypes.number.isRequired,
    index: PropTypes.number.isRequired,
};

const CustomTab = ({ tabs, initialValue = 0, sx = {}, stickyOffset = 0, value: controlledValue, onChange }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [internalValue, setInternalValue] = useState(initialValue);

    const value = controlledValue !== undefined ? controlledValue : internalValue;
    const handleChange = (event, newValue) => {
        if (controlledValue !== undefined) {
            onChange?.(newValue);
        } else {
            setInternalValue(newValue);
        }
    };

    useEffect(() => {
        if (controlledValue === undefined) {
            setInternalValue(initialValue);
        }
    }, [initialValue, controlledValue]);

    return (
        <Box sx={{ width: '100%', ...sx }}>
            <Box
                sx={{
                    position: 'sticky',
                    top: stickyOffset,
                    zIndex: 1000,
                    backgroundColor: theme.palette.background.default,
                    borderBottom: 1,
                    borderColor: 'divider',
                }}
            >
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label="compact tabs"
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 36,
                        overflowX: isMobile ? 'auto' : 'visible',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                        '&::-webkit-scrollbar': {
                            display: 'none',
                        },
                        '& .MuiTabs-flexContainer': {
                            minHeight: 36,
                        },
                        '& .MuiTab-root': {
                            minHeight: 36,
                            padding: isMobile ? '6px 8px' : '6px 12px',
                            fontSize: isMobile ? 12 : 13,
                            textTransform: 'none',
                            minWidth: 0,
                            marginRight: 1,
                            whiteSpace: 'nowrap',
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                            borderRadius: 1.5,
                            transition: 'all 0.3s ease',
                            border: '1px solid transparent',
                            '&:hover': {
                                color: theme.palette.primary.main,
                                backgroundColor: `${theme.palette.primary.main}08`,
                                borderColor: `${theme.palette.primary.main}30`,
                            },
                            '&.Mui-selected': {
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                backgroundColor: `${theme.palette.primary.main}08`,
                                borderColor: `${theme.palette.primary.main}30`,
                            },
                        },
                        '& .MuiTabs-indicator': {
                            backgroundColor: theme.palette.primary.main,
                            height: 3,
                            borderRadius: 1.5,
                        },
                    }}
                >
                    {tabs.map(({ label, icon }, i) => (
                        <Tab
                            key={i}
                            label={label}
                            icon={icon || null}
                            iconPosition={icon ? 'start' : undefined}
                            id={`custom-tab-${i}`}
                            aria-controls={`custom-tabpanel-${i}`}
                            sx={{
                                '& .MuiSvgIcon-root': {
                                    fontSize: 16,
                                    color: 'inherit',
                                }
                            }}
                        />
                    ))}
                </Tabs>
            </Box>
            {tabs.map(({ content }, i) => (
                <CustomTabPanel key={i} value={value} index={i}>
                    {content}
                </CustomTabPanel>
            ))}
        </Box>
    );
}

CustomTab.propTypes = {
    tabs: PropTypes.arrayOf(
        PropTypes.shape({
            label: PropTypes.string.isRequired,
            content: PropTypes.node.isRequired,
            icon: PropTypes.element,
        })
    ).isRequired,
    initialValue: PropTypes.number,
    value: PropTypes.number,
    onChange: PropTypes.func,
    sx: PropTypes.object,
    stickyOffset: PropTypes.number,
};

export default CustomTab;