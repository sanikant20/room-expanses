import React from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormControl, FormHelperText } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

// Constants for date formats
const DATE_FORMATS = {
    DISPLAY: 'YYYY-MM-DD',
    API: 'YYYY-MM-DD'
};

// Format Day.js object -> yyyy/mm/dd
const formatDate = (date) => {
    if (!date || !date.isValid()) return '';
    return date.format(DATE_FORMATS.API);
};

// Parse string (yyyy/MM/dd) OR Date → Day.js object
const parseDateValue = (value) => {
    if (!value) return null;

    if (dayjs.isDayjs(value)) {
        return value.isValid() ? value : null;
    }

    if (value instanceof Date) {
        return dayjs(value);
    }

    if (typeof value === 'string') {
        // Handle multiple date formats
        const formats = ['YYYY/MM/DD', 'YYYY-MM-DD', 'MM/DD/YYYY', 'MM-DD-YYYY'];
        for (const format of formats) {
            const parsed = dayjs(value, format, true); // strict parsing
            if (parsed.isValid()) {
                return parsed;
            }
        }

        // Fallback to loose parsing
        const fallbackParsed = dayjs(value.replace(/-/g, '/'));
        return fallbackParsed.isValid() ? fallbackParsed : null;
    }

    return null;
};

// Validation function for date constraints
const validateDate = (date, { minDate, maxDate, disableFuture, disablePast }) => {
    if (!date || !date.isValid()) return true;

    const today = dayjs();

    if (disableFuture && date.isAfter(today, 'day')) {
        return false;
    }

    if (disablePast && date.isBefore(today, 'day')) {
        return false;
    }

    if (minDate && date.isBefore(dayjs(minDate), 'day')) {
        return false;
    }

    if (maxDate && date.isAfter(dayjs(maxDate), 'day')) {
        return false;
    }

    return true;
};

const EnglishDatePicker = ({
    label,
    name,
    value,
    onChange,
    onBlur,
    error = false,
    helperText = '',
    disabled = false,
    readOnly = false,
    minDate,
    maxDate,
    disableFuture = false,
    disablePast = false,
    shouldDisableDate,
    sx = {},
    ...props
}) => {
    const [internalError, setInternalError] = React.useState('');

    const handleChange = (newValue) => {
        // Clear previous errors
        setInternalError('');

        if (onChange) {
            try {
                const formattedValue = newValue && newValue.isValid() ? formatDate(newValue) : '';

                // Validate date constraints
                if (newValue && newValue.isValid()) {
                    const isValid = validateDate(newValue, { minDate, maxDate, disableFuture, disablePast });
                    if (!isValid) {
                        let errorMessage = 'Invalid date selection';
                        if (disableFuture) errorMessage = 'Future dates are not allowed';
                        if (disablePast) errorMessage = 'Past dates are not allowed';
                        if (minDate) errorMessage = `Date must be after ${dayjs(minDate).format(DATE_FORMATS.DISPLAY)}`;
                        if (maxDate) errorMessage = `Date must be before ${dayjs(maxDate).format(DATE_FORMATS.DISPLAY)}`;

                        setInternalError(errorMessage);
                    }
                }

                const event = {
                    target: {
                        name,
                        value: formattedValue,
                    },
                };
                onChange(event);
            } catch (err) {
                setInternalError('Invalid date format');
                console.error('Date conversion error:', err);
            }
        }
    };

    const handleBlur = () => {
        // Create a proper Formik-compatible event object for onBlur
        if (onBlur) {
            const event = {
                target: {
                    name,
                },
            };
            onBlur(event);
        }
    };

    const hasError = error || Boolean(internalError);
    const displayHelperText = internalError || helperText;

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <FormControl
                fullWidth
                error={hasError}
                disabled={disabled}
                sx={{ minWidth: 0, ...sx }}
            >
                <DatePicker
                    label={label}
                    format={DATE_FORMATS.DISPLAY}
                    value={parseDateValue(value)}
                    onChange={handleChange}
                    onClose={handleBlur}
                    disabled={disabled || readOnly}
                    readOnly={readOnly}
                    minDate={minDate ? dayjs(minDate) : undefined}
                    maxDate={maxDate ? dayjs(maxDate) : undefined}
                    disableFuture={disableFuture}
                    disablePast={disablePast}
                    shouldDisableDate={shouldDisableDate}
                    sx={(theme) => ({
                        '& .MuiInputBase-root': {
                            height: '28px', // Very compact height
                            fontSize: '12px',
                            paddingTop: '1px',
                        },
                        '& .MuiInputBase-input': {
                            padding: '4px 8px',
                            height: 'auto',
                            fontSize: '12px',
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: '12px',
                            top: '4px',
                            '&.MuiInputLabel-shrink': {
                                transform: 'translate(14px, -8px) scale(0.75)',
                                top: '4px',
                            },
                        },
                        '& .MuiFormHelperText-root': {
                            fontSize: '10px',
                            margin: '2px 0 0 0',
                            lineHeight: 1.1,
                        },
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: `1px solid ${theme.palette.divider}`,
                        },
                        '& .MuiIconButton-root': {
                            padding: '2px',
                            '& svg': {
                                fontSize: '14px',
                            },
                        },
                    })}
                    slotProps={{
                        textField: {
                            size: 'small',
                            error: error,
                            fullWidth: true,
                            variant: 'outlined',
                            helperText: error ? helperText : undefined,
                        },
                        field: {
                            clearable: true,
                            onClear: () => handleChange(null),
                            sx: {
                                '& .MuiIconButton-root': {
                                    padding: '4px', // Reduce padding
                                    '& svg': {
                                        fontSize: '18px', // Reduce icon size
                                    }
                                },
                                '& .MuiPickersSectionList-root': {
                                    direction: 'ltr',
                                    padding: '2px 0 5px',
                                    fontFamily: 'Roboto, sans-serif',
                                    fontSize: 'inherit',
                                    lineHeight: '1.4375em',
                                    flexGrow: 1,
                                    outline: 'none',
                                    display: 'flex',
                                    flexWrap: 'nowrap',
                                    overflow: 'hidden',
                                    letterSpacing: 'inherit',
                                    width: '182px',
                                    paddingTop: '5px',
                                },
                            },
                        },
                        // Input sections
                        input: {
                            sx: {
                                padding: '0',
                                fontSize: '12px',
                                height: '24px',
                            },
                        },
                        // Icon button - more compact
                        // openPickerButton: {
                        //     sx: {
                        //         padding: '12px',
                        //         margin: '0px',
                        //         width: '16px',
                        //         height: '16px',
                        //         '& .MuiSvgIcon-root': {
                        //             fontSize: '16px',
                        //         },
                        //     },
                        // },
                        actionBar: {
                            actions: ['clear', 'today'],
                        },
                        desktopPaper: {
                            sx: {
                                '& .MuiPickersCalendarHeader-root': {
                                    direction: 'ltr',
                                },
                                '& .MuiDayCalendar-weekDayLabel': {
                                    direction: 'ltr',
                                },
                            },
                        },
                    }}
                    {...props}
                />
                {displayHelperText && (
                    <FormHelperText error={hasError} sx={{ mx: 0, mt: 0.5 }}>
                        {displayHelperText}
                    </FormHelperText>
                )}
            </FormControl>
        </LocalizationProvider>
    );
};

EnglishDatePicker.defaultProps = {
    error: false,
    helperText: '',
    disabled: false,
    readOnly: false,
    required: false,
    disableFuture: false,
    disablePast: false,
    size: 'small',
    variant: 'outlined',
};

export default EnglishDatePicker;