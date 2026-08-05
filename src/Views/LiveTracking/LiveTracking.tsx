import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PageHeader from '../../Components/Layouts/PageHeader/PageHeader';
import PageHero from '../../Components/Layouts/PageHero/PageHero';
import { useLiveTracking } from '../../hooks/useLiveTracking';
import SummaryCards from '../../Components/LiveTracking/SummaryCards/SummaryCards';
import VehicleFilters from '../../Components/LiveTracking/VehicleFilters/VehicleFilters';
import LiveTrackingMap from '../../Components/LiveTracking/LiveTrackingMap/LiveTrackingMap';
import VehicleTable from '../../Components/LiveTracking/VehicleTable/VehicleTable';
import VehicleModal from '../../Components/LiveTracking/VehicleModal/VehicleModal';
import ExceptionModal from '../../Components/LiveTracking/ExceptionModal/ExceptionModal';
import ConfirmModal from '../../Components/LiveTracking/ConfirmModal/ConfirmModal';
import { RouteException } from '../../types/liveTracking';
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
    exceptions,
    addException,
    removeException,
  } = useLiveTracking();

  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'listing' | 'map'>('map');
  const [activeMode, setActiveMode] = useState<'live' | 'history'>('live');
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [exceptionToConfirm, setExceptionToConfirm] =
    useState<RouteException | null>(null);

  // Sync selected vehicle with vehicleId route parameter
  useEffect(() => {
    if (vehicleId) {
      handleSelectVehicle(vehicleId);
    } else {
      handleSelectVehicle(null);
    }
  }, [vehicleId]); // eslint-disable-line react-hooks/exhaustive-deps

  const inboundCount = useMemo(() => {
    return vehicles.filter(v => v.direction === 'Inbound').length;
  }, [vehicles]);

  const outboundCount = useMemo(() => {
    return vehicles.filter(v => v.direction === 'Outbound').length;
  }, [vehicles]);

  const totalCount = useMemo(() => {
    return vehicles.length;
  }, [vehicles]);

  const activeDirectionFilter = activeTab === 'map' ? (mapFilters.direction || '') : (listingFilters.direction || '');

  const handleDirectionFilterChange = (dir: string) => {
    if (activeTab === 'map') {
      handleMapFilterChange('direction', dir);
    } else {
      handleListingFilterChange('direction', dir);
    }
  };

  const handleManageException = (vehicleId: string) => {
    const exc = exceptions.find(
      (e) => e.vehicleId === vehicleId || e.vehicleId === 'all'
    );
    if (exc) {
      setExceptionToConfirm(exc);
      setIsConfirmModalOpen(true);
    }
  };

  const handleViewVehicleOnMap = (id: string) => {
    navigate(`/live-tracking/${id}`);
  };

  if (vehicleId) {
    return (
      <div className="lt">
        <PageHeader />

        <PageHero
          icon={<MapIcon />}
          title={`Live Tracking - ${vehicleId}`}
          subtitle={`Detailed route and tracking analysis for vehicle ${vehicleId}.`}
          eyebrow="Vehicle Details"
          actions={null}
          backAction={{
            label: '← Back to Live Tracking',
            onClick: () => navigate('/live-tracking'),
          }}
        />

        <div className="lt__content">
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
              <div className="lt__view-container lt__view-container--map">
                <LiveTrackingMap
                  vehicles={vehicles}
                  filteredVehicles={filteredVehiclesMap}
                  selectedVehicleId={selectedVehicle ? selectedVehicle.id : null}
                  filterVehicleId={vehicleId}
                  onSelectVehicle={handleSelectVehicle}
                  geofences={geofences}
                  metrics={metrics}
                  mode={activeMode}
                  onChangeMode={setActiveMode}
                  onAddException={() => setIsExceptionModalOpen(true)}
                />
              </div>
            )
          )}
        </div>

        <ExceptionModal
          open={isExceptionModalOpen}
          vehicles={vehicles}
          geofences={geofences}
          onClose={() => setIsExceptionModalOpen(false)}
          onSave={addException}
        />

        <ConfirmModal
          open={isConfirmModalOpen}
          exception={exceptionToConfirm}
          geofences={geofences}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={() => {
            if (exceptionToConfirm) {
              removeException(exceptionToConfirm.id);
            }
            setIsConfirmModalOpen(false);
            setExceptionToConfirm(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="lt">
      <PageHeader />

      <PageHero
        icon={<MapIcon />}
        title="Live Tracking"
        subtitle="Monitor active vehicles and visualize route compliance in real time."
        eyebrow={null}
        actions={
          <div className="lt__header-actions-wrap" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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
        }
      />

      {/* Main Panel Content */}
      <div className="lt__content">
        <SummaryCards
          inbound={inboundCount}
          outbound={outboundCount}
          total={totalCount}
          activeDirectionFilter={activeDirectionFilter}
          onDirectionFilterChange={handleDirectionFilterChange}
        />

        <VehicleFilters
          mode={activeMode}
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
            <div className={`lt__view-container lt__view-container--${activeTab}`}>
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
                  metrics={metrics}
                  mode={activeMode}
                  onChangeMode={setActiveMode}
                  onAddException={() => setIsExceptionModalOpen(true)}
                />
              ) : (
                <VehicleTable
                  vehicles={filteredVehiclesListing}
                  onSelectVehicle={handleSelectVehicle}
                  onViewOnMap={handleViewVehicleOnMap}
                  onManageException={handleManageException}
                />
              )}
            </div>
          )
        )}
      </div>

      <VehicleModal
        open={isModalOpen && activeTab !== 'map'}
        vehicle={selectedVehicle}
        onClose={() => handleSelectVehicle(null)}
      />

      <ExceptionModal
        open={isExceptionModalOpen}
        vehicles={vehicles}
        geofences={geofences}
        onClose={() => setIsExceptionModalOpen(false)}
        onSave={addException}
      />

      <ConfirmModal
        open={isConfirmModalOpen}
        exception={exceptionToConfirm}
        geofences={geofences}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={() => {
          if (exceptionToConfirm) {
            removeException(exceptionToConfirm.id);
          }
          setIsConfirmModalOpen(false);
          setExceptionToConfirm(null);
        }}
      />
    </div>
  );
}
