import { createContext, useContext, useState, ReactNode } from 'react';
import { DeliveryRequest } from './requestTypes';
import { MOCK_REQUESTS } from './requestMockData';

interface RequestsCtx {
  requests: DeliveryRequest[];
  addRequest: (r: DeliveryRequest) => void;
  updateRequest: (r: DeliveryRequest) => void;
  getRequest: (id: string) => DeliveryRequest | undefined;
}

const Ctx = createContext<RequestsCtx>({
  requests: [],
  addRequest: () => {},
  updateRequest: () => {},
  getRequest: () => undefined,
});

export function RequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<DeliveryRequest[]>(MOCK_REQUESTS);

  function addRequest(r: DeliveryRequest) {
    setRequests(prev => [r, ...prev]);
  }

  function updateRequest(r: DeliveryRequest) {
    setRequests(prev => prev.map(x => x.id === r.id ? r : x));
  }

  function getRequest(id: string) {
    return requests.find(r => r.id === id);
  }

  return (
    <Ctx.Provider value={{ requests, addRequest, updateRequest, getRequest }}>
      {children}
    </Ctx.Provider>
  );
}

export function useRequests() { return useContext(Ctx); }
