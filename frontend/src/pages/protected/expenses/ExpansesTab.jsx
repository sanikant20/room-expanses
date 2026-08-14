import React, { useCallback, useRef, useState } from 'react';
import { StarOutlineRounded, StarRounded } from '@mui/icons-material';
import CustomTab from '../../../components/custom/CustomTab';
import PrimaryExpansesList from './primaryExpanses/PrimaryExpansesList';
import SecondaryExpansesList from './secondaryExpanses/SecondaryExpansesList';
import {
    formatYearMonthString,
    getCurrentBsYearMonth,
    parseYearMonthString,
} from '../../../utils/nepaliDate';

const ExpansesTab = () => {
    const [selectedMonth, setSelectedMonth] = useState(() => {
        const current = getCurrentBsYearMonth();
        return formatYearMonthString(current);
    });
    const [drafts, setDrafts] = useState({ primary: [], secondary: [] });
    const draftCounter = useRef(0);

    const addDraft = useCallback((category) => {
        draftCounter.current += 1;
        const { bsYear, bsMonth } = parseYearMonthString(selectedMonth);
        const bsDate = bsYear && bsMonth
            ? `${bsYear}/${String(bsMonth).padStart(2, '0')}/01`
            : '';
        setDrafts((prev) => ({
            ...prev,
            [category]: [
                ...prev[category],
                {
                    _id: `draft-${draftCounter.current}`,
                    title: '',
                    amount: '',
                    paidBy: '',
                    applicablePartners: [],
                    bsYear,
                    bsMonth,
                    bsDate,
                },
            ],
        }));
    }, [selectedMonth]);

    const updateDraft = useCallback((category, id, patch) => {
        setDrafts((prev) => ({
            ...prev,
            [category]: prev[category].map((d) => (d._id === id ? { ...d, ...patch } : d)),
        }));
    }, []);

    const removeDraft = useCallback((category, id) => {
        setDrafts((prev) => ({
            ...prev,
            [category]: prev[category].filter((d) => d._id !== id),
        }));
    }, []);

    const monthDrafts = (list) => list.filter(
        (d) => d.bsYear && d.bsMonth && `${d.bsYear}/${String(d.bsMonth).padStart(2, '0')}` === selectedMonth
    );

    const tabs = [
        {
            label: 'Primary Expenses',
            icon: <StarRounded />,
            content: (
                <PrimaryExpansesList
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    drafts={monthDrafts(drafts.primary)}
                    onAddDraft={() => addDraft('primary')}
                    onUpdateDraft={(id, patch) => updateDraft('primary', id, patch)}
                    onRemoveDraft={(id) => removeDraft('primary', id)}
                />
            ),
        },
        {
            label: 'Secondary Expenses',
            icon: <StarOutlineRounded />,
            content: (
                <SecondaryExpansesList
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    drafts={monthDrafts(drafts.secondary)}
                    onAddDraft={() => addDraft('secondary')}
                    onUpdateDraft={(id, patch) => updateDraft('secondary', id, patch)}
                    onRemoveDraft={(id) => removeDraft('secondary', id)}
                />
            ),
        },
    ];

    return <CustomTab tabs={tabs} />;
};

export default ExpansesTab;
