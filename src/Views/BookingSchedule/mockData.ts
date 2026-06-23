import { Company, CompanyGroup, Allocation, RouteType } from './types';

export const MOCK_GROUPS: CompanyGroup[] = [
  { id: 'g201', name: '201' },
  { id: 'g203', name: '203' },
  { id: 'g204', name: '204' },
  { id: 'g206', name: '206' },
  { id: 'g208', name: '208' },
];

export const MOCK_COMPANIES: Company[] = [
  { id: 'c1', name: 'Apex Haulage Ltd',     groupId: 'g201', assignedDeliveries: 8 },
  { id: 'c2', name: 'Meridian Freight',      groupId: 'g201', assignedDeliveries: 6 },
  { id: 'c3', name: 'Summit Logistics',      groupId: 'g203', assignedDeliveries: 12 },
  { id: 'c4', name: 'Delta Transport Co.',   groupId: 'g203', assignedDeliveries: 10 },
  { id: 'c5', name: 'Orion Deliveries',      groupId: 'g203', assignedDeliveries: 8 },
  { id: 'c6', name: 'Vantage Haulage',       groupId: 'g203', assignedDeliveries: 6 },
  { id: 'c7', name: 'Nexus Freight Ltd',     groupId: 'g204', assignedDeliveries: 9 },
  { id: 'c8', name: 'Pioneer Supply Co.',    groupId: 'g206', assignedDeliveries: 5 },
  { id: 'c9', name: 'Sterling Logistics',    groupId: 'g208', assignedDeliveries: 7 },
];

function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const today = dateOffset(0);
const yesterday = dateOffset(-1);
const tomorrow = dateOffset(1);

function rt(r: RouteType): RouteType { return r; }

export const MOCK_ALLOCATIONS: Allocation[] = [
  // Today
  { id: 'a1',  companyId: 'c5', companyName: 'Orion Deliveries',    date: today,     hour: 0,  deliveryCount: 3, notes: 'Solar toilet units — handle with care',                          driverName: 'James Harlow',  vehicleNumber: 'WK21PPF', routeType: rt('one-way'),  createdAt: `${today}T00:15:00.000Z` },
  { id: 'a2',  companyId: 'c6', companyName: 'Vantage Haulage',     date: today,     hour: 0,  deliveryCount: 2, notes: 'Steel fixings — priority unload',                                driverName: 'Sara Patel',    vehicleNumber: 'HK70RBG', routeType: rt('two-way'),  createdAt: `${today}T00:20:00.000Z` },
  { id: 'a3',  companyId: 'c5', companyName: 'Orion Deliveries',    date: today,     hour: 2,  deliveryCount: 4, notes: 'Second load — concrete blocks',                                  driverName: 'Tom Bridges',   vehicleNumber: 'BT19XYZ', routeType: rt('one-way'),  createdAt: `${today}T02:10:00.000Z` },
  { id: 'a4',  companyId: 'c6', companyName: 'Vantage Haulage',     date: today,     hour: 2,  deliveryCount: 1, notes: 'Small parts delivery',                                           driverName: 'Rachel Moore',  vehicleNumber: 'SG68LMN', routeType: rt('two-way'),  createdAt: `${today}T02:05:00.000Z` },
  { id: 'a5',  companyId: 'c7', companyName: 'Nexus Freight Ltd',   date: today,     hour: 1,  deliveryCount: 5, notes: 'Structural beams — heavy load. Bay clearance required before arrival.', driverName: 'Mike Ashton',   vehicleNumber: 'DL22RNT', routeType: rt('two-way'),  createdAt: `${today}T01:00:00.000Z` },
  { id: 'a6',  companyId: 'c3', companyName: 'Summit Logistics',    date: today,     hour: 5,  deliveryCount: 2, notes: 'Electrical conduit boxes',                                       driverName: 'Linda Chan',    vehicleNumber: 'PO71WQS', routeType: rt('two-way'),  createdAt: `${today}T05:30:00.000Z` },
  { id: 'a7',  companyId: 'c4', companyName: 'Delta Transport Co.', date: today,     hour: 6,  deliveryCount: 3, notes: 'Plumbing fittings batch 2',                                      driverName: 'David Walsh',   vehicleNumber: 'EX20KJF', routeType: rt('one-way'),  createdAt: `${today}T06:00:00.000Z` },
  { id: 'a8',  companyId: 'c8', companyName: 'Pioneer Supply Co.',  date: today,     hour: 5,  deliveryCount: 2, notes: 'Insulation panels',                                              driverName: 'Priya Sharma',  vehicleNumber: 'TR65VHM', routeType: rt('one-way'),  createdAt: `${today}T05:45:00.000Z` },
  { id: 'a9',  companyId: 'c9', companyName: 'Sterling Logistics',  date: today,     hour: 0,  deliveryCount: 1, notes: 'Urgent: safety equipment',                                       driverName: 'Owen Jenkins',  vehicleNumber: 'MA19BFP', routeType: rt('one-way'),  createdAt: `${today}T00:05:00.000Z` },
  { id: 'a10', companyId: 'c9', companyName: 'Sterling Logistics',  date: today,     hour: 4,  deliveryCount: 3, notes: 'Secondary shipment',                                             driverName: 'Owen Jenkins',  vehicleNumber: 'MA19BFP', routeType: rt('two-way'),  createdAt: `${today}T04:00:00.000Z` },
  // Yesterday
  { id: 'a11', companyId: 'c1', companyName: 'Apex Haulage Ltd',    date: yesterday, hour: 8,  deliveryCount: 4, notes: 'Aggregate delivery',                                             driverName: 'Chris Evans',   vehicleNumber: 'AB18CDX', routeType: rt('one-way'),  createdAt: `${yesterday}T08:00:00.000Z` },
  { id: 'a12', companyId: 'c3', companyName: 'Summit Logistics',    date: yesterday, hour: 10, deliveryCount: 3, notes: 'Roofing materials',                                              driverName: 'Amy Robinson',  vehicleNumber: 'XY21GHT', routeType: rt('two-way'),  createdAt: `${yesterday}T10:00:00.000Z` },
  { id: 'a13', companyId: 'c7', companyName: 'Nexus Freight Ltd',   date: yesterday, hour: 14, deliveryCount: 2, notes: 'Paint and sealant',                                              driverName: 'Nathan Ford',   vehicleNumber: 'LM70PQR', routeType: rt('one-way'),  createdAt: `${yesterday}T14:00:00.000Z` },
  // Tomorrow
  { id: 'a14', companyId: 'c2', companyName: 'Meridian Freight',    date: tomorrow,  hour: 9,  deliveryCount: 5, notes: 'Pre-scheduled morning delivery',                                 driverName: 'Fiona Blake',   vehicleNumber: 'ST22MNO', routeType: rt('two-way'),  createdAt: new Date().toISOString() },
  { id: 'a15', companyId: 'c5', companyName: 'Orion Deliveries',    date: tomorrow,  hour: 13, deliveryCount: 3, notes: 'Afternoon concrete pour supplies',                               driverName: 'Ben Carter',    vehicleNumber: 'WR19VXZ', routeType: rt('one-way'),  createdAt: new Date().toISOString() },
];

export function buildSlotKey(companyId: string, date: string, hour: number): string {
  return `${companyId}-${date}-${hour}`;
}
