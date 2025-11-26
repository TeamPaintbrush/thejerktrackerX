'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { DynamoDBService, Order, User } from '@/lib/dynamodb';
import { LoadingOverlay } from '@/components/Loading';
import { showSuccess, showError, showLoading, dismissToast } from '@/lib/toast';
import { Toaster } from 'react-hot-toast';
import { 
  Home, 
  PlusCircle, 
  Package, 
  BarChart3, 
  Settings, 
  QrCode, 
  Menu,
  X,
  User as UserIcon,
  Users,
  TrendingUp
} from 'lucide-react';

const DashboardContainer = styled.div`
  min-height: 100vh;
  background: #fafaf9;
`;

// Top Navigation Bar Components
const TopNavBar = styled.header`
  background: white;
  border-bottom: 2px solid #e7e5e4;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const NavContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
`;

const NavLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
`;

const Logo = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
`;

const LogoIcon = styled.div`
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.3);
`;

const LogoText = styled.div`
  h1 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1c1917;
    margin: 0;
    line-height: 1.2;
  }
  
  p {
    font-size: 0.75rem;
    color: #78716c;
    margin: 0;
    line-height: 1;
  }
`;

const NavMenu = styled.nav`
  display: none;
  
  @media (min-width: 1024px) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NavItem = styled.li`
  display: inline-flex;
`;

const NavButton = styled.button<{ $active: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9375rem;
  transition: all 0.2s ease;
  background: ${props => props.$active ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#44403c'};
  
  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' : '#f5f5f4'};
    color: ${props => props.$active ? 'white' : '#1c1917'};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const NavRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const UserButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.5rem;
  border: none;
  background: #f5f5f4;
  color: #1c1917;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background: #e7e5e4;
  }
`;

const MobileMenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  background: none;
  border: none;
  color: #44403c;
  cursor: pointer;
  border-radius: 0.5rem;
  
  &:hover {
    background: #f5f5f4;
  }
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 40;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  
  @media (min-width: 1024px) {
    display: none;
  }
`;

const MobileMenuNav = styled.div`
  background: white;
  width: 280px;
  height: 100%;
  overflow-y: auto;
  padding: 1.5rem;
`;

const MobileNavButton = styled.button<{ $active: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: ${props => props.$active ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' : 'transparent'};
  color: ${props => props.$active ? 'white' : '#44403c'};
  border-radius: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9375rem;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    background: ${props => props.$active ? 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)' : '#f5f5f4'};
    color: ${props => props.$active ? 'white' : '#1c1917'};
  }

  svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
  
  h2 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1c1917;
    margin: 0 0 0.5rem 0;
  }
  
  p {
    font-size: 1rem;
    color: #78716c;
    margin: 0;
  }
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
  padding-bottom: 4rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  h3 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    color: #7c3aed;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-weight: 500;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #7c3aed;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.section`
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  border: 1px solid #e7e5e4;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1c1917;
    margin: 0 0 1.5rem 0;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e7e5e4;
  }
`;

const TableContainer = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  th, td {
    text-align: left;
    padding: 1rem;
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    background: #f3f4f6;
    font-weight: 600;
    color: #374151;
  }

  tbody tr:hover {
    background: #f9fafb;
  }
`;

const StatusBadge = styled.span<{ status: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  
  ${props => {
    switch (props.status) {
      case 'pending':
        return `
          background: #fef3c7;
          color: #d97706;
        `;
      case 'picked_up':
        return `
          background: #dbeafe;
          color: #2563eb;
        `;
      case 'delivered':
        return `
          background: #d1fae5;
          color: #059669;
        `;
      case 'available':
        return `
          background: #d1fae5;
          color: #059669;
        `;
      case 'busy':
        return `
          background: #fed7aa;
          color: #ea580c;
        `;
      case 'offline':
        return `
          background: #fecaca;
          color: #dc2626;
        `;
      default:
        return `
          background: #f3f4f6;
          color: #6b7280;
        `;
    }
  }}
`;

const StaffCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const StaffHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const StaffName = styled.h4`
  margin: 0;
  color: #1f2937;
`;

const StaffInfo = styled.div`
  color: #6b7280;
  font-size: 0.9rem;
`;

export default function ManagerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [staff, setStaff] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'picked_up' | 'delivered'>('all');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session?.user?.role !== 'manager' && session?.user?.role !== 'admin') {
      router.push('/'); // Redirect if not a manager or admin
      return;
    }

    loadManagerData();
  }, [session, status, router]);

  const loadManagerData = async () => {
    try {
      setIsLoading(true);
      
      // Load orders
      const allOrders = await DynamoDBService.getAllOrders();
      setOrders(allOrders);
      
      // Load staff (drivers and customers)
      const drivers = await DynamoDBService.getUsersByRole('driver');
      const customers = await DynamoDBService.getUsersByRole('customer');
      setStaff([...drivers, ...customers]);
      
    } catch (error) {
      console.error('Error loading manager data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignDriver = async (orderId: string, driverName: string) => {
    // Validation
    if (!driverName || driverName.trim() === '') {
      showError('Please select a driver before assigning');
      return;
    }

    const toastId = showLoading(`Assigning ${driverName} to order...`);
    
    try {
      // Check if driver is available
      const driver = staffMembers.find(s => s.name === driverName && s.role === 'driver');
      if (driver && driver.driverInfo?.availability === 'offline') {
        dismissToast(toastId);
        showError(`${driverName} is currently offline`);
        return;
      }

      await DynamoDBService.updateOrder(orderId, {
        driverName: driverName,
        driverCompany: 'The JERK Tracker Fleet'
      });

      dismissToast(toastId);
      showSuccess(`Order assigned to ${driverName}`);
      loadManagerData(); // Refresh data
    } catch (error) {
      dismissToast(toastId);
      showError('Failed to assign driver');
      console.error('Error assigning driver:', error);
    }
  };

  const handleViewAnalytics = () => {
    router.push('/analytics');
  };

  const handleManageStaff = () => {
    router.push('/staff');
  };

  const handleSignOut = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await signOut({ callbackUrl: '/' });
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <DashboardContainer>
        <LoadingOverlay isLoading={true} message="Loading manager dashboard...">
          <div />
        </LoadingOverlay>
      </DashboardContainer>
    );
  }

  if (!session?.user) {
    return (
      <DashboardContainer>
        <LoadingOverlay isLoading={true} message="Redirecting...">
          <div />
        </LoadingOverlay>
      </DashboardContainer>
    );
  }

  const currentUser = session.user as User;
  const today = new Date().toDateString();
  const todayOrders = orders.filter(order => 
    new Date(order.createdAt).toDateString() === today
  );
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const inTransitOrders = orders.filter(order => order.status === 'picked_up');
  const completedToday = orders.filter(order => 
    order.status === 'delivered' && 
    new Date(order.deliveredAt || '').toDateString() === today
  );
  
  const drivers = staff.filter(user => user.role === 'driver');
  const availableDrivers = drivers.filter(driver => 
    driver.driverInfo?.availability === 'available'
  );

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const recentOrders = filteredOrders.slice(0, 10);

  const menuItems = [
    { id: 'dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { id: 'orders', icon: <Package size={20} />, label: 'Orders' },
    { id: 'staff', icon: <Users size={20} />, label: 'Staff' },
    { id: 'analytics', icon: <BarChart3 size={20} />, label: 'Analytics', href: '/analytics' },
    { id: 'qr', icon: <QrCode size={20} />, label: 'QR Codes', href: '/qr-tracking' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings', href: '/settings' },
  ];

  return (
    <DashboardContainer>
      <Toaster />
      
      {/* Mobile Menu Overlay */}
      <MobileMenu $isOpen={mobileMenuOpen} onClick={() => setMobileMenuOpen(false)}>
        <MobileMenuNav onClick={(e) => e.stopPropagation()}>
          <div style={{ marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e7e5e4' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1c1917' }}>Menu</h3>
          </div>
          {menuItems.map((item) => (
            <MobileNavButton
              key={item.id}
              $active={activeTab === item.id}
              onClick={() => {
                if (item.href) {
                  router.push(item.href);
                } else {
                  setActiveTab(item.id);
                }
                setMobileMenuOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </MobileNavButton>
          ))}
          <div style={{ height: '1px', background: '#e7e5e4', margin: '1rem 0' }} />
          <MobileNavButton $active={false} onClick={handleSignOut} style={{ color: '#dc2626' }}>
            <UserIcon size={20} />
            <span>Sign Out</span>
          </MobileNavButton>
        </MobileMenuNav>
      </MobileMenu>

      {/* Top Navigation */}
      <TopNavBar>
        <NavContainer>
          <NavLeft>
            <Logo href="/">
              <LogoIcon>JT</LogoIcon>
              <LogoText>
                <h1>TheJERKTracker</h1>
                <p>Manager Panel</p>
              </LogoText>
            </Logo>

            {/* Desktop Navigation Menu */}
            <NavMenu>
              <NavList>
                {menuItems.map((item) => (
                  <NavItem key={item.id}>
                    <NavButton
                      $active={activeTab === item.id}
                      onClick={() => {
                        if (item.href) {
                          router.push(item.href);
                        } else {
                          setActiveTab(item.id);
                        }
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </NavButton>
                  </NavItem>
                ))}
              </NavList>
            </NavMenu>
          </NavLeft>

          <NavRight>
            <MobileMenuButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </MobileMenuButton>

            <UserButton onClick={handleSignOut}>
              <UserIcon size={18} />
              <span>{session.user.name}</span>
            </UserButton>
          </NavRight>
        </NavContainer>
      </TopNavBar>

      {/* Main Content */}
      <MainContent>
        {activeTab === 'dashboard' && (
          <>
            <PageHeader>
              <h2>Manager Dashboard</h2>
              <p>Welcome back, {session.user.name}! Overview of operations.</p>
            </PageHeader>

            <StatsGrid>
              <StatCard>
                <h3>{todayOrders.length}</h3>
                <p>Orders Today</p>
              </StatCard>
              <StatCard>
                <h3>{pendingOrders.length}</h3>
                <p>Pending Orders</p>
              </StatCard>
              <StatCard>
                <h3>{inTransitOrders.length}</h3>
                <p>In Transit</p>
              </StatCard>
              <StatCard>
                <h3>{completedToday.length}</h3>
                <p>Completed Today</p>
              </StatCard>
              <StatCard>
                <h3>{availableDrivers.length}</h3>
                <p>Available Drivers</p>
              </StatCard>
              <StatCard>
                <h3>{drivers.length}</h3>
                <p>Total Drivers</p>
              </StatCard>
            </StatsGrid>

            <FilterBar>
              <SearchInput 
                type="text"
                placeholder="Search by customer, driver, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FilterSelect 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="picked_up">In Transit</option>
                <option value="delivered">Delivered</option>
              </FilterSelect>
            </FilterBar>

            <ContentGrid>
              <Section>
                <h2>Recent Orders {searchTerm || statusFilter !== 'all' ? `(${recentOrders.length} results)` : ''}</h2>
                <TableContainer>
                  <Table>
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Driver</th>
                        <th>Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.length === 0 ? (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                            {searchTerm || statusFilter !== 'all' 
                              ? 'No orders match your filters' 
                              : 'No orders yet'}
                          </td>
                        </tr>
                      ) : (
                        recentOrders.map(order => (
                          <tr key={order.id}>
                            <td>#{order.orderNumber}</td>
                            <td>{order.customerName}</td>
                            <td>
                              <StatusBadge status={order.status}>
                                {order.status}
                              </StatusBadge>
                            </td>
                            <td>{order.driverName || 'Unassigned'}</td>
                            <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </TableContainer>
              </Section>

              <Section>
                <h2>Driver Status</h2>
                {drivers.length === 0 ? (
                  <StaffCard>
                    <StaffInfo>No drivers registered yet.</StaffInfo>
                  </StaffCard>
                ) : (
                  drivers.map(driver => (
                    <StaffCard key={driver.id}>
                      <StaffHeader>
                        <StaffName>{driver.name}</StaffName>
                        <StatusBadge status={driver.driverInfo?.availability || 'offline'}>
                          {driver.driverInfo?.availability || 'offline'}
                        </StatusBadge>
                      </StaffHeader>
                      <StaffInfo>
                        <div>{driver.email}</div>
                        {driver.driverInfo?.licenseNumber && (
                          <div>License: {driver.driverInfo.licenseNumber}</div>
                        )}
                      </StaffInfo>
                    </StaffCard>
                  ))
                )}
              </Section>
            </ContentGrid>
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <PageHeader>
              <h2>All Orders</h2>
              <p>Manage and assign drivers to orders</p>
            </PageHeader>

            <FilterBar>
              <SearchInput 
                type="text"
                placeholder="Search by customer, driver, or order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FilterSelect 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="picked_up">In Transit</option>
                <option value="delivered">Delivered</option>
              </FilterSelect>
            </FilterBar>

            <Section>
              <h2>Orders {searchTerm || statusFilter !== 'all' ? `(${filteredOrders.length} results)` : ''}</h2>
              <TableContainer>
                <Table>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Customer</th>
                      <th>Status</th>
                      <th>Driver</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                          {searchTerm || statusFilter !== 'all' 
                            ? 'No orders match your filters' 
                            : 'No orders yet'}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map(order => (
                        <tr key={order.id}>
                          <td>#{order.orderNumber}</td>
                          <td>{order.customerName}</td>
                          <td>
                            <StatusBadge status={order.status}>
                              {order.status}
                            </StatusBadge>
                          </td>
                          <td>{order.driverName || 'Unassigned'}</td>
                          <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </TableContainer>
            </Section>
          </>
        )}

        {activeTab === 'staff' && (
          <>
            <PageHeader>
              <h2>Staff Management</h2>
              <p>Manage drivers and staff members</p>
            </PageHeader>

            <Section>
              <h2>All Staff ({staff.length})</h2>
              {drivers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                  No staff members found.
                </div>
              ) : (
                staff.map(member => (
                  <StaffCard key={member.id}>
                    <StaffHeader>
                      <StaffName>{member.name}</StaffName>
                      <StatusBadge status={member.driverInfo?.availability || member.role}>
                        {member.driverInfo?.availability || member.role}
                      </StatusBadge>
                    </StaffHeader>
                    <StaffInfo>
                      <div>{member.email}</div>
                      <div>Role: {member.role}</div>
                      {member.driverInfo?.licenseNumber && (
                        <div>License: {member.driverInfo.licenseNumber}</div>
                      )}
                    </StaffInfo>
                  </StaffCard>
                ))
              )}
            </Section>
          </>
        )}
      </MainContent>
    </DashboardContainer>
  );
}