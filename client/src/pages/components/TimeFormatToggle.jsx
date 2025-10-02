import React, { useState, useEffect } from 'react';
import { FaClock, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const TimeFormatToggle = ({ 
  openTime = '09:00', 
  closeTime = '22:00', 
  onTimeChange,
  label = "Business Hours"
}) => {
  const [is24Hour, setIs24Hour] = useState(false);
  const [openTimeValue, setOpenTimeValue] = useState(openTime);
  const [closeTimeValue, setCloseTimeValue] = useState(closeTime);

  // Convert 24-hour to 12-hour format
  const convertTo12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Convert 12-hour to 24-hour format
  const convertTo24Hour = (time12) => {
    if (!time12) return '';
    const [time, ampm] = time12.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    
    if (ampm === 'AM' && hour === 12) {
      hour = 0;
    } else if (ampm === 'PM' && hour !== 12) {
      hour += 12;
    }
    
    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  // Format time for display based on current format
  const formatTimeForDisplay = (time) => {
    if (!time) return '';
    return is24Hour ? time : convertTo12Hour(time);
  };

  // Handle time input change
  const handleTimeChange = (field, value) => {
    let time24Value = value;
    
    // If in 12-hour mode, convert to 24-hour for storage
    if (!is24Hour && value.includes(' ')) {
      time24Value = convertTo24Hour(value);
    }
    
    if (field === 'open') {
      setOpenTimeValue(time24Value);
    } else {
      setCloseTimeValue(time24Value);
    }
    
    // Notify parent component
    if (onTimeChange) {
      onTimeChange({
        open: field === 'open' ? time24Value : openTimeValue,
        close: field === 'close' ? time24Value : closeTimeValue
      });
    }
  };

  // Generate time options for 12-hour format
  const generate12HourOptions = () => {
    const options = [];
    for (let hour = 1; hour <= 12; hour++) {
      for (let minute of ['00', '30']) {
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute}`;
        options.push(`${timeStr} AM`);
        options.push(`${timeStr} PM`);
      }
    }
    return options;
  };

  // Generate time options for 24-hour format
  const generate24HourOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute of ['00', '30']) {
        options.push(`${hour.toString().padStart(2, '0')}:${minute}`);
      }
    }
    return options;
  };

  const timeOptions = is24Hour ? generate24HourOptions() : generate12HourOptions();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
          <FaClock className="text-blue-500" />
          {label}
        </label>
        
        {/* 12/24 Hour Toggle */}
        <div className="flex items-center gap-2">
          <span className={`text-sm ${!is24Hour ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            12H
          </span>
          <button
            type="button"
            onClick={() => setIs24Hour(!is24Hour)}
            className="text-blue-500 hover:text-blue-600 text-xl transition-colors"
          >
            {is24Hour ? <FaToggleOn /> : <FaToggleOff />}
          </button>
          <span className={`text-sm ${is24Hour ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
            24H
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Opening Time */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Opening Time
          </label>
          {is24Hour ? (
            <input
              type="time"
              value={openTimeValue}
              onChange={(e) => handleTimeChange('open', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <select
              value={formatTimeForDisplay(openTimeValue)}
              onChange={(e) => handleTimeChange('open', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select opening time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Closing Time */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Closing Time
          </label>
          {is24Hour ? (
            <input
              type="time"
              value={closeTimeValue}
              onChange={(e) => handleTimeChange('close', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          ) : (
            <select
              value={formatTimeForDisplay(closeTimeValue)}
              onChange={(e) => handleTimeChange('close', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select closing time</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Display Current Hours */}
      <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
        <strong>Current Hours:</strong> {formatTimeForDisplay(openTimeValue)} - {formatTimeForDisplay(closeTimeValue)}
      </div>
    </div>
  );
};

export default TimeFormatToggle;
