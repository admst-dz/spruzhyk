export const getUserDisplayName = (user) => {
    if (!user) return '';
    if (user.display_name) return user.display_name;
    if (user.email) return user.email.split('@')[0];
    return 'User';
};

export const getUserSecondaryLabel = (user) => {
    if (!user) return '';
    return user.email || '';
};
