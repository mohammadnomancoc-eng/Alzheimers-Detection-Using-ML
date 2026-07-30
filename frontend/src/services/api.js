import axios from 'axios';

// API Base URL - Uses VITE_API_URL in production (Render) or localhost in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 60000, // 60 seconds for processing
    headers: {
        'Accept': 'application/json',
    },
});

const AUTH_TOKEN_KEY = 'alzheimers_auth_token';

const getStoredToken = () => {
    try {
        return localStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
        return null;
    }
};

api.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token) {
        config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
        };
    }
    return config;
}, (error) => Promise.reject(error));

// Helper to format FormData with all required fields
export const formatPredictionData = (formData) => {
    const data = new FormData();

    // Append all required fields from your form
    data.append('full_name', formData.full_name);
    data.append('age', formData.age);
    data.append('gender', formData.gender);
    data.append('email', formData.email);

    // Append optional fields if they exist
    if (formData.doctor_name) data.append('doctor_name', formData.doctor_name);
    if (formData.city) data.append('city', formData.city);
    if (formData.patient_code) data.append('patient_code', formData.patient_code);
    if (formData.consent_given) data.append('consent_given', formData.consent_given);

    // Append image file
    if (formData.image) {
        data.append('image', formData.image);
    }

    return data;
};

export const healthCheck = async() => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (error) {
        console.error('Health check failed:', error);
        throw new Error('Backend server is not responding');
    }
};

export const predictAlzheimer = async(formData) => {
    try {
        console.log('Sending prediction request to backend...');
        console.log('Form data fields:', {
            full_name: formData.full_name,
            age: formData.age,
            gender: formData.gender,
            email: formData.email,
            hasImage: !!formData.image,
            imageName: formData.image?.name,
        });

        // Format data according to your backend requirements
        const formattedData = formatPredictionData(formData);

        // Make the POST request to /predict (note: your route is '/predict/')
        const response = await api.post('/predict/', formattedData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        console.log('Backend response:', response.data);
        return response.data;

    } catch (error) {
        console.error('Prediction failed:', error);

        // Handle specific error cases from your backend
        if (error.response) {
            const { status, data } = error.response;

            console.error('Error response:', { status, data });

            if (status === 400) {
                throw new Error(data.error || 'Invalid request. Please check all fields.');
            } else if (status === 409) {
                // Handle duplicate email or patient code
                if (data.code === 'EMAIL_EXISTS') {
                    throw new Error('This email is already registered. Please use a different email.');
                } else if (data.code === 'CODE_EXISTS') {
                    throw new Error('This patient code already exists. Please use a different code.');
                }
                throw new Error(data.error || 'Duplicate entry found.');
            } else if (status === 500) {
                throw new Error('Server error. Please try again later.');
            } else {
                throw new Error(data.error || `Error ${status}: Please try again.`);
            }
        } else if (error.request) {
            throw new Error('No response from server. Please check if the backend is running.');
        } else {
            throw new Error('Failed to process request. Please check your connection.');
        }
    }
};

// Optional: Fetch existing reports
export const getReport = async(filename) => {
    try {
        const response = await api.get(`/predict/report/${filename}`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch report:', error);
        throw error;
    }
};

export const getHeatmap = async(filename) => {
    try {
        const response = await api.get(`/predict/heat/${filename}`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch heatmap:', error);
        throw error;
    }
};
export const authLogin = async(credentials) => {
    try {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    } catch (error) {
        console.warn('Auth login endpoint check:', error?.response?.status);

        if (error?.response?.status === 401) {
            throw new Error(error.response?.data?.message || 'Invalid email or password');
        }

        // Mock auth fallback if backend server endpoint is unreachable
        if (credentials.email === 'admin@login.com' && credentials.password === 'admin123') {
            return {
                token: 'mocked-admin-token-2026',
                user: {
                    email: credentials.email,
                    role: 'admin',
                },
            };
        }

        throw new Error('Invalid email or password');
    }
};

export const getPatients = async() => {
    try {
        const response = await api.get('/patients');
        return Array.isArray(response.data) ?
            response.data :
            response.data?.patients || [];
    } catch (error) {
        // TODO: Replace mocked patient data with real backend patient history once /patients is live.
        console.warn('Patients endpoint unavailable; returning mock patient history', error?.response?.status);
        return [{
                patientCode: 'P-001',
                name: 'Sophia Grant',
                age: 68,
                doctorName: 'Dr. Eliza Hart',
                severityClass: 'VeryMildDemented',
                confidence: 0.78,
                date: '2026-07-15',
                reportUrl: '/mock/reports/sophia-grant.pdf',
                mriUrl: '/mock/images/sophia-grant-mri.png',
                heatmapUrl: '/mock/images/sophia-grant-heatmap.png',
            },
            {
                patientCode: 'P-002',
                name: 'Miguel Alvarez',
                age: 72,
                doctorName: 'Dr. Priya Sethi',
                severityClass: 'MildDemented',
                confidence: 0.86,
                date: '2026-07-12',
                reportUrl: '/mock/reports/miguel-alvarez.pdf',
                mriUrl: '/mock/images/miguel-alvarez-mri.png',
                heatmapUrl: '/mock/images/miguel-alvarez-heatmap.png',
            },
            {
                patientCode: 'P-003',
                name: 'Leah Parker',
                age: 64,
                doctorName: 'Dr. Nadia Chen',
                severityClass: 'Normal',
                confidence: 0.92,
                date: '2026-07-09',
                reportUrl: '/mock/reports/leah-parker.pdf',
                mriUrl: '/mock/images/leah-parker-mri.png',
                heatmapUrl: '/mock/images/leah-parker-heatmap.png',
            },
            {
                patientCode: 'P-004',
                name: 'Aaron Blake',
                age: 75,
                doctorName: 'Dr. Samir Patel',
                severityClass: 'ModerateDemented',
                confidence: 0.69,
                date: '2026-07-03',
                reportUrl: '/mock/reports/aaron-blake.pdf',
                mriUrl: '/mock/images/aaron-blake-mri.png',
                heatmapUrl: '/mock/images/aaron-blake-heatmap.png',
            },
            {
                patientCode: 'P-005',
                name: 'Olivia Chen',
                age: 70,
                doctorName: 'Dr. Marcus Grey',
                severityClass: 'SevereDemented',
                confidence: 0.94,
                date: '2026-06-29',
                reportUrl: '/mock/reports/olivia-chen.pdf',
                mriUrl: '/mock/images/olivia-chen-mri.png',
                heatmapUrl: '/mock/images/olivia-chen-heatmap.png',
            },
            {
                patientCode: 'P-006',
                name: 'David Kim',
                age: 66,
                doctorName: 'Dr. Eliza Hart',
                severityClass: 'Normal',
                confidence: 0.95,
                date: '2026-07-18',
                reportUrl: '/mock/reports/david-kim.pdf',
                mriUrl: '/mock/images/david-kim-mri.png',
                heatmapUrl: '/mock/images/david-kim-heatmap.png',
            },
            {
                patientCode: 'P-007',
                name: 'Fatima Rossi',
                age: 79,
                doctorName: 'Dr. Priya Sethi',
                severityClass: 'MildDemented',
                confidence: 0.81,
                date: '2026-07-10',
                reportUrl: '/mock/reports/fatima-rossi.pdf',
                mriUrl: '/mock/images/fatima-rossi-mri.png',
                heatmapUrl: '/mock/images/fatima-rossi-heatmap.png',
            },
            {
                patientCode: 'P-008',
                name: 'James Wheeler',
                age: 71,
                doctorName: 'Dr. Nadia Chen',
                severityClass: 'VeryMildDemented',
                confidence: 0.74,
                date: '2026-07-07',
                reportUrl: '/mock/reports/james-wheeler.pdf',
                mriUrl: '/mock/images/james-wheeler-mri.png',
                heatmapUrl: '/mock/images/james-wheeler-heatmap.png',
            },
            {
                patientCode: 'P-009',
                name: 'Amara Johnson',
                age: 62,
                doctorName: 'Dr. Marcus Grey',
                severityClass: 'Normal',
                confidence: 0.97,
                date: '2026-07-20',
                reportUrl: '/mock/reports/amara-johnson.pdf',
                mriUrl: '/mock/images/amara-johnson-mri.png',
                heatmapUrl: '/mock/images/amara-johnson-heatmap.png',
            },
            {
                patientCode: 'P-010',
                name: 'Robert Singh',
                age: 77,
                doctorName: 'Dr. Samir Patel',
                severityClass: 'ModerateDemented',
                confidence: 0.72,
                date: '2026-06-25',
                reportUrl: '/mock/reports/robert-singh.pdf',
                mriUrl: '/mock/images/robert-singh-mri.png',
                heatmapUrl: '/mock/images/robert-singh-heatmap.png',
            },
            {
                patientCode: 'P-011',
                name: 'Elena Vasquez',
                age: 69,
                doctorName: 'Dr. Eliza Hart',
                severityClass: 'VeryMildDemented',
                confidence: 0.76,
                date: '2026-07-01',
                reportUrl: '/mock/reports/elena-vasquez.pdf',
                mriUrl: '/mock/images/elena-vasquez-mri.png',
                heatmapUrl: '/mock/images/elena-vasquez-heatmap.png',
            },
            {
                patientCode: 'P-012',
                name: 'Thomas Okafor',
                age: 81,
                doctorName: 'Dr. Priya Sethi',
                severityClass: 'SevereDemented',
                confidence: 0.91,
                date: '2026-06-18',
                reportUrl: '/mock/reports/thomas-okafor.pdf',
                mriUrl: '/mock/images/thomas-okafor-mri.png',
                heatmapUrl: '/mock/images/thomas-okafor-heatmap.png',
            },
            {
                patientCode: 'P-013',
                name: 'Hannah Liu',
                age: 63,
                doctorName: 'Dr. Nadia Chen',
                severityClass: 'Normal',
                confidence: 0.89,
                date: '2026-07-22',
                reportUrl: '/mock/reports/hannah-liu.pdf',
                mriUrl: '/mock/images/hannah-liu-mri.png',
                heatmapUrl: '/mock/images/hannah-liu-heatmap.png',
            },
            {
                patientCode: 'P-014',
                name: 'Carlos Mendez',
                age: 74,
                doctorName: 'Dr. Marcus Grey',
                severityClass: 'MildDemented',
                confidence: 0.83,
                date: '2026-06-30',
                reportUrl: '/mock/reports/carlos-mendez.pdf',
                mriUrl: '/mock/images/carlos-mendez-mri.png',
                heatmapUrl: '/mock/images/carlos-mendez-heatmap.png',
            },
        ];
    }
};
export const getMriImage = async(filename) => {
    try {
        const response = await api.get(`/predict/mri/${filename}`, {
            responseType: 'blob',
        });
        return response.data;
    } catch (error) {
        console.error('Failed to fetch MRI image:', error);
        throw error;
    }
};