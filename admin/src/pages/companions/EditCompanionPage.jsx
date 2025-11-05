import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BASE_URL from '../../context/Api';
import { FaSpinner } from 'react-icons/fa';
import CompanionForm from './CompanionForm';

const EditCompanionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCompanion();
  }, [id]);

  const fetchCompanion = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/companions/${id}`);
      setCompanion(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching companion:', err);
      setError('Failed to fetch companion details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="w-8 h-8 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (error || !companion) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-600">{error || 'Companion not found'}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-6">
        Edit Companion: {companion.name}
      </h1>
      <CompanionForm mode="edit" initialData={companion} />
    </div>
  );
};

export default EditCompanionPage; 