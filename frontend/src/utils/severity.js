export const severityColorMap = {
    Normal: '#4CAF50',
    NonDemented: '#4CAF50',
    VeryMildDemented: '#8BC34A',
    MildDemented: '#FFC107',
    ModerateDemented: '#FF9800',
    SevereDemented: '#F44336',
};

export const getSeverityColor = (severity) => {
    return severityColorMap[severity] || '#666';
};

export const severityFilters = [
    { value: '', label: 'All Severities' },
    { value: 'Normal', label: 'Normal / NonDemented' },
    { value: 'VeryMildDemented', label: 'Very Mild Demented' },
    { value: 'MildDemented', label: 'Mild Demented' },
    { value: 'ModerateDemented', label: 'Moderate Demented' },
    { value: 'SevereDemented', label: 'Severe Demented' },
];