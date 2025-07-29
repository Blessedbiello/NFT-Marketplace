import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Shield, 
  Settings, 
  TrendingUp, 
  Users, 
  DollarSign, 
  BarChart3,
  AlertTriangle,
  Clock,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download,
  Filter,
  Search,
  Crown,
  Database,
  Activity,
  ShoppingBag,
  Star
} from 'lucide-react';
import { useMarketplace } from '../../contexts/MarketplaceContext';
import { Button } from '../common/Button';
import { StatsCard } from '../dashboard/StatsCard';

export function ComprehensiveAdminPanel() {
  const { connected } = useWallet();
  const { marketplace, stats, listings, updateFee, loading } = useMarketplace();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'users' | 'listings' | 'analytics' | 'activity'>('overview');
  const [newFee, setNewFee] = useState('');
  const [newRateLimit, setNewRateLimit] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock admin data
  const adminData = {
    totalRevenue: stats ? (stats.totalVolume * (marketplace?.fee || 2.5) / 100) : 0,
    totalTransactions: stats ? stats.totalListings * 3 : 0,
    pendingReports: 12,
    blockedUsers: 3,
    recentActivity: [
      { id: '1', type: 'fee_update', user: 'Admin', details: 'Updated marketplace fee to 2.5%', timestamp: Date.now() - 7200000, severity: 'info' },
      { id: '2', type: 'large_sale', user: 'user123...abc', details: 'Large NFT sale: 25.5 SOL', timestamp: Date.now() - 10800000, severity: 'success' },
      { id: '3', type: 'suspicious_activity', user: 'user456...def', details: 'Multiple rapid listings detected', timestamp: Date.now() - 14400000, severity: 'warning' },
      { id: '4', type: 'user_report', user: 'user789...ghi', details: 'User reported for fake NFT', timestamp: Date.now() - 18000000, severity: 'error' },
      { id: '5', type: 'new_user', user: 'user012...jkl', details: 'New user registration', timestamp: Date.now() - 21600000, severity: 'info' },
    ],
    usersList: [
      { id: '1', address: 'ABC123...XYZ', joinDate: Date.now() - 2592000000, totalTrades: 45, volume: 123.5, status: 'active', reputation: 4.8 },
      { id: '2', address: 'DEF456...UVW', joinDate: Date.now() - 1728000000, totalTrades: 23, volume: 67.2, status: 'active', reputation: 4.2 },
      { id: '3', address: 'GHI789...RST', joinDate: Date.now() - 864000000, totalTrades: 12, volume: 34.1, status: 'suspended', reputation: 2.1 },
      { id: '4', address: 'JKL012...OPQ', joinDate: Date.now() - 432000000, totalTrades: 67, volume: 234.7, status: 'active', reputation: 4.9 },
    ]
  };

  if (!connected) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="w-24 h-24 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-12 w-12 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-gray-400">
          Connect your wallet to access the admin panel.
        </p>
      </div>
    );
  }

  const handleUpdateFee = async () => {
    if (newFee) {
      await updateFee(parseFloat(newFee));
      setNewFee('');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-primary-400';
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'error': return 'bg-red-900/20 border-red-500/30';
      case 'warning': return 'bg-yellow-900/20 border-yellow-500/30';
      case 'success': return 'bg-green-900/20 border-green-500/30';
      default: return 'bg-primary-900/20 border-primary-500/30';
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl flex items-center justify-center animate-pulse-glow">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-gray-400">Comprehensive marketplace management</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="secondary" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="primary" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4 border-l-4 border-red-500">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div>
              <p className="text-red-400 font-semibold">Pending Reports</p>
              <p className="text-white text-lg">{adminData.pendingReports}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 border-l-4 border-yellow-500">
          <div className="flex items-center space-x-3">
            <Ban className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-yellow-400 font-semibold">Blocked Users</p>
              <p className="text-white text-lg">{adminData.blockedUsers}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4 border-l-4 border-green-500">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-green-400 font-semibold">System Status</p>
              <p className="text-white text-lg">Operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={`${adminData.totalRevenue.toFixed(2)} SOL`}
            change="+18.2% this month"
            changeType="positive"
            icon={DollarSign}
          />
          <StatsCard
            title="Total Transactions"
            value={adminData.totalTransactions.toLocaleString()}
            change="+12.8% this month"
            changeType="positive"
            icon={TrendingUp}
          />
          <StatsCard
            title="Active Users"
            value={stats.activeUsers.toLocaleString()}
            change="+8.1% this month"
            changeType="positive"
            icon={Users}
          />
          <StatsCard
            title="Marketplace Fee"
            value={`${marketplace?.fee || 2.5}%`}
            change="Last updated 2h ago"
            icon={Settings}
          />
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="card p-0">
        <div className="border-b border-primary-800/30">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'listings', label: 'Listings', icon: ShoppingBag },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'activity', label: 'Activity', icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <div className="space-y-3">
                    {adminData.recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className={`p-4 rounded-lg border ${getSeverityBg(activity.severity)}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className={`w-2 h-2 rounded-full ${getSeverityColor(activity.severity).replace('text-', 'bg-')}`} />
                              <span className={`font-medium ${getSeverityColor(activity.severity)}`}>
                                {activity.type.replace('_', ' ').toUpperCase()}
                              </span>
                            </div>
                            <p className="text-white text-sm">{activity.details}</p>
                            <p className="text-gray-400 text-xs mt-1">
                              {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Users */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Top Users</h3>
                  <div className="space-y-3">
                    {adminData.usersList
                      .sort((a, b) => b.volume - a.volume)
                      .slice(0, 5)
                      .map((user, index) => (
                        <div key={user.id} className="card p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">#{index + 1}</span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.address}</p>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="text-gray-400 text-sm">{user.reputation}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-primary-400 font-semibold">{user.volume} SOL</p>
                              <p className="text-gray-400 text-sm">{user.totalTrades} trades</p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Fee Management */}
                <div className="card p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Fee Management</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Marketplace Fee
                      </label>
                      <div className="p-3 bg-dark-400/50 rounded-lg">
                        <span className="text-lg font-semibold text-primary-400">
                          {marketplace?.fee || 2.5}%
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Fee Percentage
                      </label>
                      <div className="flex space-x-3">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          value={newFee}
                          onChange={(e) => setNewFee(e.target.value)}
                          placeholder="Enter new fee %"
                          className="input-primary flex-1"
                        />
                        <Button
                          onClick={handleUpdateFee}
                          loading={loading}
                          disabled={!newFee}
                        >
                          Update Fee
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-sm text-yellow-400">
                        <strong>Note:</strong> Fee changes affect all future transactions. 
                        Recommended range: 1-5%.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Rate Limiting */}
                <div className="card p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Rate Limiting</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Current Rate Limit
                      </label>
                      <div className="p-3 bg-dark-400/50 rounded-lg">
                        <span className="text-lg font-semibold text-primary-400">
                          {marketplace?.rateLimit || 100} tx/hour
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        New Rate Limit
                      </label>
                      <div className="flex space-x-3">
                        <input
                          type="number"
                          min="1"
                          value={newRateLimit}
                          onChange={(e) => setNewRateLimit(e.target.value)}
                          placeholder="Transactions per hour"
                          className="input-primary flex-1"
                        />
                        <Button
                          loading={loading}
                          disabled={!newRateLimit}
                        >
                          Update Limit
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <p className="text-sm text-blue-400">
                        <strong>Info:</strong> Rate limiting prevents spam and ensures 
                        fair marketplace access.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-primary w-full pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="input-primary"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="banned">Banned</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-dark-400/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Join Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Trades
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Volume
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-800/30">
                      {adminData.usersList.map((user) => (
                        <tr key={user.id} className="hover:bg-dark-400/20">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">
                                  {user.address.slice(0, 2)}
                                </span>
                              </div>
                              <div>
                                <p className="text-white font-medium">{user.address}</p>
                                <div className="flex items-center space-x-1">
                                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                                  <span className="text-gray-400 text-sm">{user.reputation}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {new Date(user.joinDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-white">
                            {user.totalTrades}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-primary-400 font-semibold">
                            {user.volume} SOL
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                              user.status === 'active' 
                                ? 'bg-green-900/20 text-green-400' 
                                : 'bg-red-900/20 text-red-400'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
                              <Button variant="secondary" size="sm">
                                View
                              </Button>
                              <Button 
                                variant={user.status === 'active' ? 'outline' : 'primary'} 
                                size="sm"
                              >
                                {user.status === 'active' ? 'Suspend' : 'Activate'}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Other tabs can be implemented similarly */}
          {activeTab === 'listings' && (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Listings Management</h3>
              <p className="text-gray-400">Advanced listing management features coming soon</p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Advanced Analytics</h3>
              <p className="text-gray-400">Detailed analytics dashboard coming soon</p>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">All Activity</h3>
              {adminData.recentActivity.map((activity) => (
                <div key={activity.id} className={`p-4 rounded-lg border ${getSeverityBg(activity.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className={`w-2 h-2 rounded-full ${getSeverityColor(activity.severity).replace('text-', 'bg-')}`} />
                        <span className={`font-medium ${getSeverityColor(activity.severity)}`}>
                          {activity.type.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-white text-sm">{activity.details}</p>
                      <p className="text-gray-400 text-xs mt-1">
                        {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}