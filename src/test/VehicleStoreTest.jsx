import React, { useEffect, useState } from 'react';
import { useCreditCustomerStore } from '../store/useCreditCustomerStore';
import { useCustomerStore } from '../store/useCustomerStore';

const VehicleStoreTest = () => {
  const { 
    allVehicleDetails, 
    fetchAllVehicleDetails, 
    getVehiclesForCustomer, 
    loading,
    error 
  } = useCreditCustomerStore();
  
  const { customers, fetchCustomers } = useCustomerStore();
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  useEffect(() => {
    fetchCustomers();
    fetchAllVehicleDetails();
  }, [fetchCustomers, fetchAllVehicleDetails]);

  const handleCustomerChange = (e) => {
    setSelectedCustomerId(e.target.value);
  };

  const customerVehicles = selectedCustomerId ? getVehiclesForCustomer(selectedCustomerId) : [];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Vehicle Store Optimization Test</h1>
      
      {/* Loading State */}
      {loading && (
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
          Loading vehicle details...
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}
      
      {/* All Vehicle Details */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">All Vehicle Details (Raw Data)</h2>
        <div className="bg-gray-100 p-4 rounded">
          <pre className="text-sm overflow-auto">
            {JSON.stringify(allVehicleDetails, null, 2)}
          </pre>
        </div>
      </div>
      
      {/* Customer Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Test Customer Vehicle Mapping</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Customer:</label>
          <select 
            value={selectedCustomerId} 
            onChange={handleCustomerChange}
            className="border border-gray-300 rounded px-3 py-2 w-full max-w-md"
          >
            <option value="">-- Select Customer --</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.customer_name} (ID: {customer.id})
              </option>
            ))}
          </select>
        </div>
        
        {/* Customer Vehicles */}
        {selectedCustomerId && (
          <div>
            <h3 className="text-lg font-medium mb-2">
              Vehicles for Customer ID: {selectedCustomerId}
            </h3>
            {customerVehicles.length > 0 ? (
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <ul className="list-disc list-inside">
                  {customerVehicles.map((vehicle, index) => (
                    <li key={index} className="text-green-800">
                      {vehicle.vehicle_no} (Generated ID: {vehicle.id})
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded">
                No vehicles found for this customer
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Performance Info */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4">
        <h3 className="text-lg font-medium mb-2">Performance Benefits</h3>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li>✅ Single API call fetches all vehicle details</li>
          <li>✅ Data is cached and reused across components</li>
          <li>✅ No repeated API calls when customer changes</li>
          <li>✅ Fast vehicle lookup by customer ID</li>
          <li>✅ Automatic cache invalidation after 5 minutes</li>
        </ul>
      </div>
    </div>
  );
};

export default VehicleStoreTest; 