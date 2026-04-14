export const erodeLocations = [
    { pincode: '638001', name: 'Erode City', type: 'CITY' },
    { pincode: '638104', name: 'Modakkurichi', type: 'RURAL' },
    { pincode: '638401', name: 'Sathyamangalam', type: 'CITY' },
    { pincode: '638461', name: 'Thalavadi', type: 'HILL' },
    { pincode: '636001', name: 'Salem City', type: 'CITY' },
    { pincode: '636601', name: 'Yercaud', type: 'HILL' },
    { pincode: '641001', name: 'Coimbatore City', type: 'CITY' },
    { pincode: '641301', name: 'Valparai', type: 'HILL' }
];

export const getLocationsDropdownOptions = () => {
    return erodeLocations.map(loc => ({
        value: `${loc.pincode} - ${loc.name}`,
        label: `${loc.pincode} - ${loc.name}`,
        pincode: loc.pincode,
        areaName: loc.name,
        type: loc.type
    }));
};
