import React from 'react';
import CompanionForm from './CompanionForm';

const AddCompanionPage = () => {
  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-800 mb-6">Add New Companion</h1>
      <CompanionForm mode="add" />
    </div>
  );
};

export default AddCompanionPage; 