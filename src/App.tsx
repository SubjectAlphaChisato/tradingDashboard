import React, { useState, useEffect } from 'react';
import { TransactionSummary, TabKey, TimeframeData } from './types';

const formatNumber = (value: number | undefined, decimals: number = 2): string => {
  if (value === undefined || value === null) return '0';
  return value.toLocaleString(undefined, { 
    minimumFractionDigits: decimals, 
    maximumFractionDigits: decimals 
  });
};

const formatCurrency = (value: number | undefined): string => {
  if (value === undefined || value === null) return '$0.00';
  return `$${formatNumber(value, 2)}`;
};

const MetricCard: React.FC<{ label: string; value: string; isProfit?: boolean }> = ({ 
  label, 
  value, 
  isProfit 
}) => (
  <div className="metric-card">
    <div className="metric-label">{label}</div>
    <div className={`metric-value ${isProfit === true ? 'positive' : isProfit === false ? 'negative' : ''}`}>
      {value}
    </div>
  </div>
);

const TabContent: React.FC<{ data: TimeframeData; timeframe: TabKey }> = ({ data, timeframe }) => {
  const currentBalance = timeframe === 'total' 
    ? (data.pm_hold || 0) + (data.eth_hold || 0)
    : (data.pm_purchased || 0) + (data.eth_purchased || 0) - (data.pm_sold || 0) - (data.eth_sold || 0);

  const realizedProfit = data.total_profit || 0;
  const unrealizedProfit = timeframe === 'total' ? (data.unrealized_profit || 0) : 0;

  return (
    <div className="tab-content">
      <div className="metrics-grid">
        <MetricCard 
          label="PM Tokens Purchased" 
          value={formatNumber(data.pm_purchased || 0, 4)} 
        />
        <MetricCard 
          label="ETH Purchased" 
          value={formatNumber(data.eth_purchased || 0, 6)} 
        />
        <MetricCard 
          label="Current Balance" 
          value={formatCurrency(currentBalance)} 
        />
        <MetricCard 
          label="Realized Profit" 
          value={formatCurrency(realizedProfit)}
          isProfit={realizedProfit >= 0}
        />
        {timeframe === 'total' && (
          <MetricCard 
            label="Unrealized Profit" 
            value={formatCurrency(unrealizedProfit)}
            isProfit={unrealizedProfit >= 0}
          />
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<TransactionSummary | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('1hour');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:8081/transaction_summary');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: TransactionSummary = await response.json();
      setData(result);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      console.error('Error fetching transaction summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const tabs: { key: TabKey; label: string }[] = [
    { key: '1hour', label: '1 Hour' },
    { key: '1day', label: '1 Day' },
    { key: '7days', label: '7 Days' },
    { key: 'total', label: 'Total' },
  ];

  if (loading && !data) {
    return (
      <div className="dashboard">
        <div className="loading">Loading trading data...</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="dashboard">
        <div className="error">
          Error: {error}
          <br />
          <small>Make sure the API server is running on localhost:8081</small>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Trading Dashboard</h1>
        <p className="dashboard-subtitle">Real-time trading statistics and performance</p>
      </div>

      {lastUpdate && (
        <div className="refresh-indicator">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      <div className="tabs-container">
        <div className="tabs-header">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {data && (
          <TabContent 
            data={data[activeTab]} 
            timeframe={activeTab}
          />
        )}
      </div>

      {error && data && (
        <div style={{ 
          position: 'fixed', 
          bottom: '1rem', 
          right: '1rem', 
          background: '#ff6b6b', 
          color: 'white', 
          padding: '0.5rem 1rem', 
          borderRadius: '6px',
          fontSize: '0.875rem'
        }}>
          Connection error: {error}
        </div>
      )}
    </div>
  );
};

export default App;
