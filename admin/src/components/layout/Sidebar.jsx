import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FaHome,
  FaUsers,
  FaCog,
  FaSignOutAlt,
  FaUserCircle,
  FaMoneyBillWave,
  FaUserPlus,
  FaCreditCard,
  FaPalette,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { 
      path: '/', 
      icon: FaHome, 
      text: 'Dashboard'
    },
    { 
      path: '/users', 
      icon: FaUsers, 
      text: 'Users'
    },
    { 
      path: '/companions', 
      icon: FaUsers, 
      text: 'Companions'
    },
    { 
      path: '/configurations', 
      icon: FaCog, 
      text: 'Configurations'
    },
    { 
      path: '/billing', 
      icon: FaMoneyBillWave, 
      text: 'Billing'
    },
    { 
      path: '/registrations', 
      icon: FaUserPlus, 
      text: 'New Registrations'
    },
    { 
      path: '/stripe', 
      icon: FaCreditCard, 
      text: 'Stripe'
    },
    { 
      path: '/theme', 
      icon: FaPalette, 
      text: 'Design Theme'
    }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`${collapsed ? 'w-16' : 'w-56'} bg-[#151529] flex flex-col h-full transition-all duration-300`}>
      {/* Logo and Toggle */}
      <div className="p-3 border-b border-gray-600/30 flex justify-between items-center">
        {!collapsed && <h2 className="text-lg font-bold text-gray-200 text-left">Amora</h2>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-full hover:bg-gray-700 text-gray-300 transition-colors"
        >
          {collapsed ? <FaChevronRight size={14} /> : <FaChevronLeft size={14} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="py-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} px-3 py-2 text-gray-300 hover:bg-gray-600 border-b border-gray-600/20 transition-colors
                ${isActive(item.path) ? 'bg-gray-600 border-l-2 border-gray-300 font-medium' : ''}`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="text-xs ml-2">{item.text}</span>}
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-600/30 mt-auto">
        <Link
          to="/login"
          onClick={(e) => {
            e.preventDefault();
            logout();
          }}
          className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start'} w-full px-3 py-3 text-xs text-gray-300 hover:bg-gray-600 transition-colors`}
        >
          <FaSignOutAlt className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="ml-2">Sign Out</span>}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;