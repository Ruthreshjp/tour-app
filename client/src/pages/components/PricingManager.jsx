import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes, FaBed, FaTable, FaCar } from 'react-icons/fa';

const PricingManager = ({ businessType, initialPricing = {}, onPricingChange }) => {
  const [pricing, setPricing] = useState(initialPricing);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    setPricing(initialPricing);
  }, [initialPricing]);

  const handlePricingUpdate = (newPricing) => {
    setPricing(newPricing);
    onPricingChange(newPricing);
  };

  // Hotel Pricing Management
  const HotelPricing = () => {
    const [rooms, setRooms] = useState(pricing.rooms || []);

    const addRoom = () => {
      const newRoom = {
        id: Date.now(),
        roomType: 'standard',
        bedType: 'single',
        isAC: false,
        pricing: { day: 0, night: 0, dayAndNight: 0 },
        amenities: []
      };
      const updatedRooms = [...rooms, newRoom];
      setRooms(updatedRooms);
      handlePricingUpdate({ ...pricing, rooms: updatedRooms });
    };

    const updateRoom = (id, field, value) => {
      const updatedRooms = rooms.map(room => 
        room.id === id ? { ...room, [field]: value } : room
      );
      setRooms(updatedRooms);
      handlePricingUpdate({ ...pricing, rooms: updatedRooms });
    };

    const updateRoomPricing = (id, pricingType, value) => {
      const updatedRooms = rooms.map(room => 
        room.id === id ? { 
          ...room, 
          pricing: { ...room.pricing, [pricingType]: parseFloat(value) || 0 }
        } : room
      );
      setRooms(updatedRooms);
      handlePricingUpdate({ ...pricing, rooms: updatedRooms });
    };

    const removeRoom = (id) => {
      const updatedRooms = rooms.filter(room => room.id !== id);
      setRooms(updatedRooms);
      handlePricingUpdate({ ...pricing, rooms: updatedRooms });
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaBed className="text-blue-500" />
            Room Pricing Configuration
          </h3>
          <button
            onClick={addRoom}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <FaPlus /> Add Room Type
          </button>
        </div>

        {rooms.map((room) => (
          <div key={room.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Room Type</label>
                <select
                  value={room.roomType}
                  onChange={(e) => updateRoom(room.id, 'roomType', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="standard">Standard</option>
                  <option value="deluxe">Deluxe</option>
                  <option value="suite">Suite</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Bed Configuration</label>
                <select
                  value={room.bedType}
                  onChange={(e) => updateRoom(room.id, 'bedType', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="single">Single Bed</option>
                  <option value="double">Double Bed</option>
                  <option value="triple">Triple Bed</option>
                  <option value="quad">Four Beds</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">AC Type</label>
                <select
                  value={room.isAC}
                  onChange={(e) => updateRoom(room.id, 'isAC', e.target.value === 'true')}
                  className="w-full p-2 border rounded"
                >
                  <option value={false}>Non-AC</option>
                  <option value={true}>AC</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => removeRoom(room.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Day Rate (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={room.pricing.day}
                  onChange={(e) => updateRoomPricing(room.id, 'day', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Night Rate (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={room.pricing.night}
                  onChange={(e) => updateRoomPricing(room.id, 'night', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">24 Hours Rate (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={room.pricing.dayAndNight}
                  onChange={(e) => updateRoomPricing(room.id, 'dayAndNight', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}

        {rooms.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FaBed className="mx-auto text-4xl mb-2" />
            <p>No room types configured. Add your first room type to get started.</p>
          </div>
        )}
      </div>
    );
  };

  // Restaurant Pricing Management
  const RestaurantPricing = () => {
    const [tables, setTables] = useState(pricing.tables || []);

    const addTable = () => {
      const newTable = {
        id: Date.now(),
        tableType: 'regular',
        capacity: 4,
        isAC: false,
        pricing: { perPerson: 0, tableCharge: 0 },
        location: 'indoor'
      };
      const updatedTables = [...tables, newTable];
      setTables(updatedTables);
      handlePricingUpdate({ ...pricing, tables: updatedTables });
    };

    const updateTable = (id, field, value) => {
      const updatedTables = tables.map(table => 
        table.id === id ? { ...table, [field]: value } : table
      );
      setTables(updatedTables);
      handlePricingUpdate({ ...pricing, tables: updatedTables });
    };

    const updateTablePricing = (id, pricingType, value) => {
      const updatedTables = tables.map(table => 
        table.id === id ? { 
          ...table, 
          pricing: { ...table.pricing, [pricingType]: parseFloat(value) || 0 }
        } : table
      );
      setTables(updatedTables);
      handlePricingUpdate({ ...pricing, tables: updatedTables });
    };

    const removeTable = (id) => {
      const updatedTables = tables.filter(table => table.id !== id);
      setTables(updatedTables);
      handlePricingUpdate({ ...pricing, tables: updatedTables });
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaTable className="text-green-500" />
            Table Pricing Configuration
          </h3>
          <button
            onClick={addTable}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
          >
            <FaPlus /> Add Table Type
          </button>
        </div>

        {tables.map((table) => (
          <div key={table.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Table Type</label>
                <select
                  value={table.tableType}
                  onChange={(e) => updateTable(table.id, 'tableType', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="regular">Regular</option>
                  <option value="premium">Premium</option>
                  <option value="vip">VIP</option>
                  <option value="family">Family</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <select
                  value={table.capacity}
                  onChange={(e) => updateTable(table.id, 'capacity', parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                >
                  <option value={2}>2 People</option>
                  <option value={4}>4 People</option>
                  <option value={6}>6 People</option>
                  <option value={8}>8 People</option>
                  <option value={10}>10 People</option>
                  <option value={12}>12 People</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">AC Type</label>
                <select
                  value={table.isAC}
                  onChange={(e) => updateTable(table.id, 'isAC', e.target.value === 'true')}
                  className="w-full p-2 border rounded"
                >
                  <option value={false}>Non-AC</option>
                  <option value={true}>AC</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <select
                  value={table.location}
                  onChange={(e) => updateTable(table.id, 'location', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="indoor">Indoor</option>
                  <option value="outdoor">Outdoor</option>
                  <option value="terrace">Terrace</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => removeTable(table.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Per Person Charge (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={table.pricing.perPerson}
                  onChange={(e) => updateTablePricing(table.id, 'perPerson', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Table Reservation Charge (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={table.pricing.tableCharge}
                  onChange={(e) => updateTablePricing(table.id, 'tableCharge', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}

        {tables.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FaTable className="mx-auto text-4xl mb-2" />
            <p>No table types configured. Add your first table type to get started.</p>
          </div>
        )}
      </div>
    );
  };

  // Cab Pricing Management
  const CabPricing = () => {
    const [vehicles, setVehicles] = useState(pricing.vehicles || []);

    const addVehicle = () => {
      const newVehicle = {
        id: Date.now(),
        vehicleType: 'sedan',
        capacity: 4,
        isAC: false,
        pricing: { perKm: 0, baseFare: 0, waitingCharges: 0 },
        features: []
      };
      const updatedVehicles = [...vehicles, newVehicle];
      setVehicles(updatedVehicles);
      handlePricingUpdate({ ...pricing, vehicles: updatedVehicles });
    };

    const updateVehicle = (id, field, value) => {
      const updatedVehicles = vehicles.map(vehicle => 
        vehicle.id === id ? { ...vehicle, [field]: value } : vehicle
      );
      setVehicles(updatedVehicles);
      handlePricingUpdate({ ...pricing, vehicles: updatedVehicles });
    };

    const updateVehiclePricing = (id, pricingType, value) => {
      const updatedVehicles = vehicles.map(vehicle => 
        vehicle.id === id ? { 
          ...vehicle, 
          pricing: { ...vehicle.pricing, [pricingType]: parseFloat(value) || 0 }
        } : vehicle
      );
      setVehicles(updatedVehicles);
      handlePricingUpdate({ ...pricing, vehicles: updatedVehicles });
    };

    const removeVehicle = (id) => {
      const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== id);
      setVehicles(updatedVehicles);
      handlePricingUpdate({ ...pricing, vehicles: updatedVehicles });
    };

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FaCar className="text-yellow-500" />
            Vehicle Pricing Configuration
          </h3>
          <button
            onClick={addVehicle}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 flex items-center gap-2"
          >
            <FaPlus /> Add Vehicle Type
          </button>
        </div>

        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle Type</label>
                <select
                  value={vehicle.vehicleType}
                  onChange={(e) => updateVehicle(vehicle.id, 'vehicleType', e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="hatchback">Hatchback</option>
                  <option value="sedan">Sedan</option>
                  <option value="suv">SUV</option>
                  <option value="luxury">Luxury</option>
                  <option value="tempo">Tempo Traveller</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Capacity</label>
                <select
                  value={vehicle.capacity}
                  onChange={(e) => updateVehicle(vehicle.id, 'capacity', parseInt(e.target.value))}
                  className="w-full p-2 border rounded"
                >
                  <option value={4}>4 Seater</option>
                  <option value={6}>6 Seater</option>
                  <option value={7}>7 Seater</option>
                  <option value={8}>8 Seater</option>
                  <option value={12}>12 Seater</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">AC Type</label>
                <select
                  value={vehicle.isAC}
                  onChange={(e) => updateVehicle(vehicle.id, 'isAC', e.target.value === 'true')}
                  className="w-full p-2 border rounded"
                >
                  <option value={false}>Non-AC</option>
                  <option value={true}>AC</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => removeVehicle(vehicle.id)}
                  className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Per Kilometer (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={vehicle.pricing.perKm}
                  onChange={(e) => updateVehiclePricing(vehicle.id, 'perKm', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Base Fare (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={vehicle.pricing.baseFare}
                  onChange={(e) => updateVehiclePricing(vehicle.id, 'baseFare', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Waiting Charges (₹/hour)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={vehicle.pricing.waitingCharges}
                  onChange={(e) => updateVehiclePricing(vehicle.id, 'waitingCharges', e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        ))}

        {vehicles.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FaCar className="mx-auto text-4xl mb-2" />
            <p>No vehicle types configured. Add your first vehicle type to get started.</p>
          </div>
        )}
      </div>
    );
  };

  // Render appropriate pricing component based on business type
  const renderPricingComponent = () => {
    switch (businessType?.toLowerCase()) {
      case 'hotel':
        return <HotelPricing />;
      case 'restaurant':
        return <RestaurantPricing />;
      case 'cab':
        return <CabPricing />;
      case 'cafe':
        return <RestaurantPricing />; // Cafes use similar table structure
      case 'shopping':
        return (
          <div className="text-center py-8 text-gray-500">
            <p>Shopping businesses don't require pricing configuration.</p>
            <p>Customers will see individual product prices.</p>
          </div>
        );
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>Please select a business type to configure pricing.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Pricing Management</h2>
        <p className="text-gray-600">Configure pricing for your {businessType} business</p>
      </div>
      
      {renderPricingComponent()}
    </div>
  );
};

export default PricingManager;
