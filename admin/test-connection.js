import axios from 'axios';

const testConnection = async () => {
    try {
        console.log('Testing connection to http://localhost:5000/health...');
        const response = await axios.get('http://localhost:5000/health');
        console.log('Success:', response.data);
    } catch (error) {
        console.error('Connection failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
};

testConnection();
