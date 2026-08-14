import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Card,
    CardHeader,
    CardContent,
    useTheme,
    IconButton,
    Collapse,
    Box,
    Tooltip,
    Typography
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { ExpandLessRounded, ExpandMoreRounded } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const StyledCard = styled(Card, {
    shouldForwardProp: (prop) => prop !== 'cardColor',
})(({ theme, cardColor }) => ({
    borderRadius: theme.shape.borderRadius,
    width: '100%',
    maxWidth: '100%',
    marginBottom: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    backgroundColor: cardColor || theme.palette.background.paper,
    transition: 'all 0.3s ease',
    overflow: 'visible',
    border: `1px solid ${theme.palette.divider}`,
}));

const Header = styled(CardHeader, {
    shouldForwardProp: (prop) => prop !== 'headerColor',
})(({ theme, headerColor = '#fff' }) => ({
    backgroundColor: headerColor ?
        alpha(headerColor, 0.1) :
        alpha(theme.palette.primary.main, 0.1),
    color: headerColor || theme.palette.primary.main,
    padding: theme.spacing(1),
    borderTopLeftRadius: theme.shape.borderRadius,
    borderTopRightRadius: theme.shape.borderRadius,
    borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
    '.MuiCardHeader-title': {
        fontSize: '1rem',
        fontWeight: 'bold',
        color: headerColor || theme.palette.primary.main,
    },
    '.MuiCardHeader-subtitle': {
        color: alpha(headerColor || theme.palette.primary.main, 0.8),
        fontSize: '0.875rem',
    },
    cursor: 'pointer',
    '&:hover': {
        backgroundColor: headerColor ?
            alpha(headerColor, 0.15) :
            alpha(theme.palette.primary.main, 0.15),
    },
    transition: 'all 0.2s ease',
}));

const ExpandIcon = styled(IconButton)(({ theme, headerColor }) => ({
    color: headerColor || theme.palette.primary.main,
    padding: theme.spacing(0.5),
    backgroundColor: alpha(headerColor || theme.palette.primary.main, 0.1),
    '&:hover': {
        backgroundColor: alpha(headerColor || theme.palette.primary.main, 0.2),
        transform: 'scale(1.05)',
    },
    transition: 'all 0.2s ease',
}));

const CustomCard = ({
    icon = null,
    title,
    subtitle,
    children,
    cardColor = '',
    headerColor = '',
    extra,
    defaultExpanded = true,
    collapsible = false,
    onToggle,
    ...props
}) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(defaultExpanded);

    useEffect(() => {
        setExpanded(defaultExpanded);
    }, [defaultExpanded]);

    const handleToggle = () => {
        if (collapsible) {
            const newExpandedState = !expanded;
            setExpanded(newExpandedState);
            if (onToggle) {
                onToggle(newExpandedState);
            }
        }
    };

    const renderExpandButton = () => {
        if (!collapsible) return null;

        return (
            <Tooltip title={expanded ? t('common.collapse', 'Collapse') : t('common.expand', 'Expand')} placement="left" arrow>
                <ExpandIcon
                    onClick={handleToggle}
                    aria-expanded={expanded}
                    aria-label={expanded ? t('common.collapse', 'Collapse') : t('common.expand', 'Expand')}
                    size="small"
                    headerColor={headerColor}
                >
                    {expanded ? <ExpandLessRounded /> : <ExpandMoreRounded />}
                </ExpandIcon>
            </Tooltip>
        );
    };
    const renderTitle = () => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon && (
                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: headerColor || theme.palette.primary.main
                }}>
                    {icon}
                </Box>
            )}
            <Box>
                <Typography
                    variant="h6"
                    component="span"
                    sx={{
                        color: headerColor || theme.palette.primary.main,
                        fontWeight: 600,
                        fontSize: '1rem',
                    }}
                >
                    {title}
                </Typography>
                {subtitle && (
                    <Typography
                        variant="body2"
                        component="div"
                        sx={{
                            color: alpha(headerColor || theme.palette.primary.main, 0.8),
                            fontSize: '0.875rem',
                            mt: 0.25,
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Box>
    );

    return (
        <StyledCard cardColor={cardColor} {...props}>
            <Header
                headerColor={headerColor}
                title={renderTitle()}
                action={
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        mr: 0.5
                    }}>
                        {extra}
                        {renderExpandButton()}
                    </Box>
                }
                onClick={handleToggle}
                sx={{
                    ...(collapsible && { cursor: 'pointer' }),
                }}
            />

            <Collapse in={expanded} timeout="auto" unmountOnExit>
                <CardContent
                    sx={{
                        padding: theme.spacing(1),
                        backgroundColor: cardColor,
                        borderBottomLeftRadius: theme.shape.borderRadius,
                        borderBottomRightRadius: theme.shape.borderRadius,
                    }}
                >
                    {children}
                </CardContent>
            </Collapse>
        </StyledCard>
    );
};

CustomCard.propTypes = {
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
    children: PropTypes.node.isRequired,
    cardColor: PropTypes.string,
    headerColor: PropTypes.string,
    extra: PropTypes.node,
    defaultExpanded: PropTypes.bool,
    collapsible: PropTypes.bool,
    onToggle: PropTypes.func,
};

CustomCard.defaultProps = {
    cardColor: '',
    headerColor: '',
    extra: null,
    defaultExpanded: true,
    collapsible: false,
};

export default CustomCard;