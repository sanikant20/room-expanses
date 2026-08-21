let authData = {};

export const setAuthData = (data) => {
    authData = {
        _id: data?._id || '',
        name: data?.name || data?.email?.split('@')[0] || '',
        email: data?.email || '',
        phone: data?.phone || '',
        image: data?.image || '',
        accountType: data?.accountType || 'user',
        role: data?.role || '',
        status: data?.status || '',
        bsJoiningDate: data?.bsJoiningDate || '',
        createdAt: data?.createdAt || null,
    };
};

export const getAuthData = () => authData;

export const clearAuthCache = () => {
    authData = {};
};
