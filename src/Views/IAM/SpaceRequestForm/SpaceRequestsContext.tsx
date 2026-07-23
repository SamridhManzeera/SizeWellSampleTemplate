import { createContext, useContext, useState, ReactNode } from 'react';
import { SpaceRequestRecord } from './spaceRequestFormTypes';
import { SPACE_REQUEST_MOCK_DATA } from './spaceRequestFormMockData';

interface SpaceRequestsCtx {
  requests: SpaceRequestRecord[];
  addRequest: (r: SpaceRequestRecord) => void;
  getRequest: (id: string) => SpaceRequestRecord | undefined;
}

const Ctx = createContext<SpaceRequestsCtx>({
  requests: [],
  addRequest: () => {},
  getRequest: () => undefined,
});

export function SpaceRequestsProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<SpaceRequestRecord[]>(
    SPACE_REQUEST_MOCK_DATA
  );

  function addRequest(r: SpaceRequestRecord) {
    setRequests((prev) => [r, ...prev]);
  }

  function getRequest(id: string) {
    return requests.find((r) => r.id === id);
  }

  return (
    <Ctx.Provider value={{ requests, addRequest, getRequest }}>
      {children}
    </Ctx.Provider>
  );
}

export function useSpaceRequests() {
  return useContext(Ctx);
}
