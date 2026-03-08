export const erodeLocations = [
    { pincode: '638311', name: 'Ammapettai' },
    { pincode: '638501', name: 'Anthiyur' },
    { pincode: '638301', name: 'Bhavani' },
    { pincode: '638051', name: 'Chennimalai' },
    { pincode: '638102', name: 'Chittode' },
    { pincode: '638001', name: 'Erode City' },
    { pincode: '638452', name: 'Gobichettipalayam' },
    { pincode: '638701', name: 'Kangayam' },
    { pincode: '638151', name: 'Kodumudi' },
    { pincode: '638104', name: 'Modakkurichi' },
    { pincode: '638458', name: 'Nambiyur' },
    { pincode: '638052', name: 'Perundurai' },
    { pincode: '638401', name: 'Sathyamangalam' },
    { pincode: '638461', name: 'Thalavadi' },
    { pincode: '638107', name: 'Thindal' }
];

export const getLocationsDropdownOptions = () => {
    return erodeLocations.map(loc => ({
        value: `${loc.pincode} - ${loc.name}`,
        label: `${loc.pincode} - ${loc.name}`
    }));
};
