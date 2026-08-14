import { useEffect, useCallback, useRef } from 'react';
import {
    Box,
    IconButton,
    InputLabel,
    Typography,
    Stack,
    useTheme
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ClearRounded } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { formRadius } from '../../theme/ThemePrimitives';
import NepaliDate from 'nepali-date-converter';
import Calendar from '@sbmdkl/nepali-datepicker-reactjs';
import '@sbmdkl/nepali-datepicker-reactjs/dist/index.css';

const getNeumorphShadow = (mode) =>
    mode === 'dark'
        ? '6px 6px 12px rgba(0, 0, 0, 0.4), -6px -6px 12px rgba(60, 60, 80, 0.15)'
        : '6px 6px 12px rgba(163, 177, 198, 0.4), -6px -6px 12px rgba(255, 255, 255, 0.6)';

const DatePickerWrapper = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '100%',
    // Input field (library class `react-calendar__input`)
    '& input': {
        width: '100%',
        height: '36px',
        boxSizing: 'border-box',
        padding: theme.spacing(0.75, 7, 0.75, 1.2),
        fontSize: '0.875rem',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 500,
        borderRadius: `${formRadius}px`,
        border: '1px solid',
        borderColor: alpha(theme.palette.grey[200], 0.5),
        backgroundColor: alpha(theme.palette.primary.light, 0.02),
        color: theme.palette.text.primary,
        transition: 'all 150ms ease-in-out',
        cursor: 'pointer',
        '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.light, 0.04),
        },
        '&:focus': {
            outline: `3px solid ${alpha(theme.palette.primary.main, 0.3)}`,
            borderColor: theme.palette.primary.main,
            backgroundColor: alpha(theme.palette.primary.light, 0.04),
        },
        '&:disabled': {
            backgroundColor: theme.palette.action.disabledBackground,
            color: theme.palette.text.disabled,
            cursor: 'not-allowed',
        },
        '&::placeholder': {
            opacity: 0.6,
            color: theme.palette.grey[500],
        },
    },
    // Popup container (library class `react-calendar`)
    '& ._2xcMq': {
        zIndex: 1300,
        width: '300px',
        minWidth: '300px',
        maxWidth: '300px',
        borderRadius: `${formRadius}px`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        backgroundColor: alpha(theme.palette.background.paper, 0.98),
        backdropFilter: 'blur(8px)',
        backgroundImage: 'none',
        overflow: 'hidden',
        fontSize: '0.875rem',
        color: theme.palette.text.primary,
        boxShadow: getNeumorphShadow(theme.palette.mode),
    },
    // Header (library class `header` + `theme-header-default`)
    '& ._1Op28': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderRadius: `${formRadius}px ${formRadius}px 0 0`,
        padding: theme.spacing(1),
        alignItems: 'center',
    },
    '& ._1mUuW': {
        backgroundColor: theme.palette.primary.main,
    },
    '& ._bBYU7': {
        borderColor: theme.palette.primary.contrastText,
    },
    // Month / Year select (library class `header__mycontainer__select`)
    '& ._2aNF9': {
        color: theme.palette.primary.contrastText,
        borderRadius: '6px',
        padding: '4px 8px',
        margin: '0 2px',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 600,
        fontFamily: 'Inter, sans-serif',
        backgroundColor: alpha(theme.palette.primary.contrastText, 0.12),
        border: '1px solid',
        borderColor: alpha(theme.palette.primary.contrastText, 0.35),
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        outline: 'none',
        '&:hover, &:focus': {
            backgroundColor: alpha(theme.palette.primary.contrastText, 0.22),
        },
        '& option': {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.paper,
        },
    },
    '& ._3fmCl': {
        borderColor: theme.palette.primary.contrastText,
    },
    // Day labels (library class `react-calendar__days-day`)
    '& ._1yGdK': {
        color: theme.palette.text.secondary,
        fontSize: '0.75rem',
        padding: '6px 0',
        fontWeight: 600,
    },
    '& ._1hh2I': {
        backgroundColor: 'transparent',
    },
    // Date cells (library class `react-calendar__dates-date`)
    '& ._249_g': {
        borderRadius: `${formRadius}px`,
        transition: 'all 0.2s ease',
    },
    '& ._3zVi3, & ._1plWg': {
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.text.primary,
        },
    },
    // Today
    '& ._WrIdy': {
        color: theme.palette.primary.main,
        fontWeight: 600,
        '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
        },
    },
    // Selected
    '& ._1ImcB': {
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        borderRadius: `${formRadius}px`,
        boxShadow: getNeumorphShadow(theme.palette.mode),
        '&:hover': {
            backgroundColor: theme.palette.primary.dark,
        },
    },
    // Circle overrides for today/selected → square corners
    '& ._1oebL, & ._FsLy_': {
        borderRadius: `${formRadius}px`,
    },
    // Disabled dates
    '& ._1EpF_, & ._3_2T4': {
        color: theme.palette.text.disabled,
        '&:hover': {
            borderRadius: `${formRadius}px`,
            backgroundColor: alpha(theme.palette.grey[200], 0.4),
            cursor: 'not-allowed',
        },
    },
    '&.disabled-picker': {
        opacity: 0.7,
        pointerEvents: 'none',
        '& input': {
            backgroundColor: theme.palette.action.disabledBackground,
            cursor: 'not-allowed',
        },
    },
    '&.error-picker': {
        '& input': {
            borderColor: theme.palette.error.main,
            '&:focus': {
                outlineColor: alpha(theme.palette.error.main, 0.3),
                borderColor: theme.palette.error.main,
            },
        },
    },
    ...theme.applyStyles('dark', {
        '& input': {
            borderColor: alpha(theme.palette.grey[700], 0.5),
            backgroundColor: alpha(theme.palette.grey[800], 0.2),
            '&:hover': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.grey[700], 0.3),
            },
            '&:focus': {
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.grey[700], 0.3),
            },
        },
        '& ._2xcMq': {
            backgroundColor: alpha(theme.palette.background.paper, 0.95),
            boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.05)',
        },
        '& ._1ImcB': {
            boxShadow: '6px 6px 12px rgba(0, 0, 0, 0.5), -6px -6px 12px rgba(255, 255, 255, 0.05)',
        },
    }),
}));

const IconOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    gap: theme.spacing(0.5),
    zIndex: 1,
    backgroundColor: 'transparent',
    pointerEvents: 'auto',
}));

export const NepaliDatePickerComponent = ({
    value,
    onChange,
    label = "",
    disabled = false,
    required = false,
    error = false,
    helperText = '',
    fullWidth = true,
    allowClear = true,
    minDate,
    maxDate,
    dateFormat = 'YYYY/MM/DD',
    hideDefaultValue = false,
    sx = {}
}) => {
    const theme = useTheme();
    const valueRef = useRef(value);

    useEffect(() => {
        valueRef.current = value;
    }, [value]);

    // The library only reads `defaultDate` on mount (no componentDidUpdate),
    // so an externally-changed value never syncs. Remounting via a key whose
    // value tracks the date forces the calendar to re-read it. Object values
    // need a canonical key (String({...}) would be "[object Object]").
    const getPickerKey = (val) => {
        if (val && typeof val === 'object') return val.bsDate || val.adDate || 'empty';
        return val ? String(val) : 'empty';
    };

    // Convert the controlled value (AD string, BS string or {bsDate, adDate})
    // into the BS `YYYY-MM-DD` format expected by the Calendar `defaultDate`.
    const getBsValue = (val) => {
        if (!val) return undefined;
        let bs = null;
        let ad = null;
        if (typeof val === 'object') {
            bs = val.bsDate;
            ad = val.adDate;
        } else {
            const str = String(val);
            if (str.includes('/')) {
                bs = str;
            } else {
                ad = str;
            }
        }
        if (bs && bs.includes('/')) {
            const dash = bs.replace(/\//g, '-');
            return dash.split('-').length === 3 ? dash : undefined;
        }
        if (ad) {
            try {
                const nDate = new NepaliDate(new Date(ad));
                const bsDate = nDate.getBS();
                const month = String(bsDate.month + 1).padStart(2, '0');
                const day = String(bsDate.date).padStart(2, '0');
                return `${bsDate.year}-${month}-${day}`;
            } catch {
                return undefined;
            }
        }
        return undefined;
    };

    const handleClear = useCallback((e) => {
        e.stopPropagation();
        if (onChange && !disabled) {
            onChange('');
        }
    }, [onChange, disabled]);

    const handleDateChange = useCallback(({ bsDate, adDate }) => {
        if (!disabled) {
            const current = valueRef.current;
            // A controlled value may be a `{bsDate, adDate}` object, a BS
            // `YYYY/MM/DD` string or an AD `YYYY-MM-DD` string — compare both
            // representations so re-picking the currently selected date does not
            // fire a redundant onChange.
            const matchesCurrent =
                (current && typeof current === 'object' &&
                    (current.adDate === adDate || current.bsDate === bsDate)) ||
                (current && typeof current === 'string' &&
                    (current === adDate || current === bsDate));
            if (onChange && !matchesCurrent) {
                onChange({ bsDate, adDate });
            }
        }
    }, [disabled, onChange]);

    return (
        <Stack spacing={1} sx={sx}>
            {label && (
                <InputLabel
                    required={required}
                    sx={{
                        fontWeight: 500,
                        fontSize: '0.8125rem',
                        color: error ? theme.palette.error.main : 'text.secondary',
                    }}
                >
                    {label}
                </InputLabel>
            )}

            <DatePickerWrapper
                className={`${disabled ? 'disabled-picker' : ''} ${error ? 'error-picker' : ''}`}
                sx={{ fullWidth: fullWidth ? 1 : 0 }}
            >
                <Box sx={{ position: 'relative' }}>
                    <Calendar
                        key={getPickerKey(value)}
                        onChange={handleDateChange}
                        theme="default"
                        language='en'
                        dateFormat={dateFormat}
                        hideDefaultValue={hideDefaultValue || !value}
                        defaultDate={getBsValue(value)}
                        minDate={minDate ? String(minDate).replace(/\//g, '-') : undefined}
                        maxDate={maxDate ? String(maxDate).replace(/\//g, '-') : undefined}
                        placeholder="Select Date"
                    />

                    {!disabled && (
                        <IconOverlay>
                            {allowClear && value && (
                                <IconButton
                                    size="small"
                                    onClick={handleClear}
                                >
                                    <ClearRounded sx={{ fontSize: 'small' }} />
                                </IconButton>
                            )}
                        </IconOverlay>
                    )}
                </Box>
            </DatePickerWrapper>

            {helperText && (
                <Typography
                    variant="caption"
                    sx={{
                        mt: 0.5,
                        ml: 1.5,
                        color: error ? theme.palette.error.main : 'text.secondary',
                        display: 'block',
                    }}
                >
                    {helperText}
                </Typography>
            )}
        </Stack>
    );
};
