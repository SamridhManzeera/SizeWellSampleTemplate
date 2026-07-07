import { useState } from 'react';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import { useLiveTracking } from '../../hooks/useLiveTracking';
import SummaryCards from '../../Components/LiveTracking/SummaryCards/SummaryCards';
import VehicleFilters from '../../Components/LiveTracking/VehicleFilters/VehicleFilters';
import LiveTrackingMap from '../../Components/LiveTracking/LiveTrackingMap/LiveTrackingMap';
import VehicleTable from '../../Components/LiveTracking/VehicleTable/VehicleTable';
import VehicleModal from '../../Components/LiveTracking/VehicleModal/VehicleModal';
import './LiveTracking.scss';

function MapIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z" />
    </svg>
  );
}

export default function LiveTracking() {
  const {
    vehicles,
    filteredVehiclesMap,
    filteredVehiclesListing,
    geofences,
    metrics,
    mapFilters,
    listingFilters,
    selectedVehicle,
    isModalOpen,
    loading,
    error,
    handleSelectVehicle,
    handleMapFilterChange,
    handleListingFilterChange,
    resetMapFilters,
    resetListingFilters,
    refreshData,
  } = useLiveTracking();

  const [activeTab, setActiveTab] = useState<'listing' | 'map'>('map');

  const handleViewVehicleOnMap = (id: string) => {
    setActiveTab('map');
    handleMapFilterChange('vehicleId', id);
    handleSelectVehicle(id);
  };

  return (
    <div className="lt">
      <PageHeader />

      {/* Hero Banner */}
      <div className="lt__hero">
        <div className="lt__hero-left">
          <div className="lt__hero-icon">
            <MapIcon />
          </div>
          <div>
            <h1 className="lt__hero-title">Live Tracking</h1>
            <p className="lt__hero-sub">
              Monitor active vehicles and visualize route compliance in real
              time.
            </p>
          </div>
        </div>
        <div className="lt__hero-right">
          <div className="lt__tabs">
            <button
              type="button"
              className={`lt__tab-btn ${
                activeTab === 'listing' ? 'lt__tab-btn--active' : ''
              }`}
              onClick={() => setActiveTab('listing')}
            >
              📋 Listing View
            </button>
            <button
              type="button"
              className={`lt__tab-btn ${
                activeTab === 'map' ? 'lt__tab-btn--active' : ''
              }`}
              onClick={() => setActiveTab('map')}
            >
              🗺️ Map View
            </button>
          </div>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="lt__content">
        <SummaryCards
          metrics={metrics}
          activeStatusFilter={
            activeTab === 'map' ? mapFilters.status : listingFilters.status
          }
          onStatusFilterChange={(status) =>
            activeTab === 'map'
              ? handleMapFilterChange('status', status)
              : handleListingFilterChange('status', status)
          }
        />

        <VehicleFilters
          vehicles={vehicles}
          filters={activeTab === 'map' ? mapFilters : listingFilters}
          onFilterChange={
            activeTab === 'map'
              ? handleMapFilterChange
              : handleListingFilterChange
          }
          onReset={activeTab === 'map' ? resetMapFilters : resetListingFilters}
          onRefresh={refreshData}
        />

        {error && (
          <div className="lt__error-alert">
            <span className="lt__error-alert-icon">⚠️</span>
            <div className="lt__error-alert-content">
              <h4>Initialization Error</h4>
              <p>{error}</p>
            </div>
            <button
              type="button"
              className="lt__error-alert-retry"
              onClick={refreshData}
            >
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="lt__loading-placeholder">
            <div className="lt__spinner" />
            <span className="lt__loading-text">
              Loading tracking data and GPX geometry...
            </span>
          </div>
        ) : (
          !error && (
            <div className="lt__view-container">
              {activeTab === 'map' ? (
                <LiveTrackingMap
                  vehicles={vehicles}
                  filteredVehicles={filteredVehiclesMap}
                  selectedVehicleId={
                    selectedVehicle ? selectedVehicle.id : null
                  }
                  filterVehicleId={mapFilters.vehicleId}
                  onSelectVehicle={handleSelectVehicle}
                  geofences={geofences}
                />
              ) : (
                <VehicleTable
                  vehicles={filteredVehiclesListing}
                  onSelectVehicle={handleSelectVehicle}
                  onViewOnMap={handleViewVehicleOnMap}
                />
              )}
            </div>
          )
        )}
      </div>

      <VehicleModal
        open={isModalOpen}
        vehicle={selectedVehicle}
        onClose={() => handleSelectVehicle(null)}
      />
    </div>
  );
}
