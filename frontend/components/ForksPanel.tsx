import { useState, useEffect } from 'react';
import { forksAPI } from '../lib/api';

export default function ForksPanel() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [forkName, setForkName] = useState('');
  const [selectedService, setSelectedService] = useState('');

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await forksAPI.listServices();
      if (response.data.success) {
        setServices(response.data.data);
        if (response.data.data.length > 0) {
          setSelectedService(response.data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to load services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFork = async () => {
    if (!forkName || !selectedService) return;

    try {
      setLoading(true);
      await forksAPI.create({
        serviceId: selectedService,
        name: forkName,
      });
      setForkName('');
      alert('Fork created successfully!');
      await loadServices();
    } catch (error) {
      console.error('Failed to create fork:', error);
      alert('Failed to create fork. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create Fork */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">🔀 Create Zero-Copy Fork</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Parent Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              disabled={loading}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name} ({service.id})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Fork Name</label>
            <input
              type="text"
              value={forkName}
              onChange={(e) => setForkName(e.target.value)}
              placeholder="experiment-fork"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              disabled={loading}
            />
          </div>

          <button
            onClick={handleCreateFork}
            disabled={loading || !forkName}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Fork'}
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h3 className="font-medium text-sm mb-2">💡 About Zero-Copy Forks</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Tiger Cloud uses copy-on-write technology to create instant database copies.
            Only changes are stored separately, enabling safe experimentation without
            duplicating data.
          </p>
        </div>
      </div>

      {/* Services List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Tiger Services</h2>
          <button onClick={loadServices} className="text-primary hover:text-blue-600">
            🔄 Refresh
          </button>
        </div>

        {loading && services.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Loading services...</p>
        ) : services.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No services found</p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-gray-500 mt-1">{service.id}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {service.status}
                      </span>
                      <span className="text-xs text-gray-500">{service.region}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
