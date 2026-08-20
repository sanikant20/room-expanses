import { convertToBSFormat } from './dateConverter';

const idOf = (value) => String(value?._id ?? value ?? '');

export const getTurnPartnerStatus = (partner, currentTurn, completed) => {
    const id = idOf(partner);
    if (!id) return 'pending';
    if (currentTurn && idOf(currentTurn) === id) return 'current';
    if ((completed || []).some((c) => idOf(c) === id)) return 'done';
    return 'pending';
};

export const isCoveredEvent = (event) => {
    if (!event) return false;
    const assigned = idOf(event.assignedPartner);
    const brought = idOf(event.broughtByPartner);
    return !!assigned && !!brought && assigned !== brought;
};

export const formatTurnDateTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return `${convertToBSFormat(date)}, ${time}`;
};