'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Users,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';

const UsersContainer = styled.div`
  padding: 0.5rem;
  min-height: 100vh;
  background: linear-gradient(135deg, #fef7ee 0%, #fafaf9 100%);
`;

const Header = styled.div`
  margin-top: 0.5rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

const Controls = styled.div`
  margin-bottom: 1.5rem;
`;

const SearchBar = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
`;

const FilterRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${props => props.active ? '#ed7734' : '#d1d5db'};
  background: ${props => props.active ? '#ed7734' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  
  &:active {
    transform: scale(0.98);
  }
`;

const AddButton = styled(motion.button)`
  width: 100%;
  padding: 0.75rem;
  background: #ed7734;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
`;

const UsersList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const UserCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const UserHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.75rem;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
`;

const UserRole = styled.div<{ role: string }>`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  background: ${props => {
    switch(props.role) {
      case 'admin': return 'rgba(239, 68, 68, 0.1)';
      case 'manager': return 'rgba(59, 130, 246, 0.1)';
      case 'driver': return 'rgba(16, 185, 129, 0.1)';
      default: return 'rgba(107, 114, 128, 0.1)';
    }
  }};
  color: ${props => {
    switch(props.role) {
      case 'admin': return '#dc2626';
      case 'manager': return '#2563eb';
      case 'driver': return '#059669';
      default: return '#4b5563';
    }
  }};
  text-transform: capitalize;
`;

const UserActions = styled.div`
  position: relative;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 4px;
  color: #6b7280;
  
  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6b7280;
`;

const StatusBadge = styled.div<{ status: string }>`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  background: ${props => props.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${props => props.status === 'active' ? '#059669' : '#dc2626'};
  text-transform: capitalize;
`;

const UserStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
  font-size: 0.75rem;
  color: #6b7280;
`;

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'driver' | 'customer';
  status: 'active' | 'inactive';
  joinDate: string;
  lastActive: string;
  ordersCount: number;
}

interface MobileUsersProps {
  className?: string;
}

export default function MobileUsers({ className }: MobileUsersProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (roleFilter !== 'all') {
        params.append('role', roleFilter);
      }
      
      const url = `/api/users${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success && data.users) {
        // Map API users to component format
        const mappedUsers: User[] = data.users.map((apiUser: any) => ({
          id: apiUser.id,
          name: apiUser.name,
          email: apiUser.email,
          phone: apiUser.phone || 'N/A',
          role: apiUser.role,
          status: 'active', // Can add status field to User model later
          joinDate: new Date(apiUser.createdAt).toISOString().split('T')[0],
          lastActive: calculateLastActive(apiUser.updatedAt || apiUser.createdAt),
          ordersCount: 0 // TODO: Get from orders API later
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      // Keep empty array on error
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateLastActive = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const roleFilters = [
    { key: 'all', label: 'All Users' },
    { key: 'admin', label: 'Admins' },
    { key: 'manager', label: 'Managers' },
    { key: 'driver', label: 'Drivers' },
    { key: 'customer', label: 'Customers' }
  ];

  if (loading) {
    return (
      <UsersContainer className={className}>
        <Header>
          <Title>Loading Users...</Title>
        </Header>
      </UsersContainer>
    );
  }

  return (
    <UsersContainer className={className}>
      <Header>
        <Title>Manage Users</Title>
        <Subtitle>{users.length} total users</Subtitle>
      </Header>

      <Controls>
        <SearchBar>
          <SearchIcon>
            <Search size={16} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>

        <FilterRow>
          {roleFilters.map(filter => (
            <FilterButton
              key={filter.key}
              active={roleFilter === filter.key}
              onClick={() => setRoleFilter(filter.key)}
            >
              {filter.label}
            </FilterButton>
          ))}
        </FilterRow>

        <AddButton
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            // TODO: Create a mobile user creation page at /mobile/admin/users/create
            router.push('/mobile/admin/users/create');
          }}
        >
          <Plus size={16} />
          Add New User
        </AddButton>
      </Controls>

      <UsersList>
        <AnimatePresence>
          {filteredUsers.map((user, index) => (
            <UserCard
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <UserHeader>
                <UserInfo>
                  <UserName>{user.name}</UserName>
                  <UserRole role={user.role}>{user.role}</UserRole>
                </UserInfo>
                <UserActions>
                  <ActionButton onClick={() => router.push(`/mobile/admin/users/${user.id}/edit`)}>
                    <MoreVertical size={16} />
                  </ActionButton>
                </UserActions>
              </UserHeader>

              <UserDetails>
                <DetailRow>
                  <Mail size={14} />
                  {user.email}
                </DetailRow>
                <DetailRow>
                  <Phone size={14} />
                  {user.phone}
                </DetailRow>
                <DetailRow>
                  <Calendar size={14} />
                  Joined {new Date(user.joinDate).toLocaleDateString()}
                </DetailRow>
                <DetailRow>
                  {user.status === 'active' ? <UserCheck size={14} /> : <UserX size={14} />}
                  <StatusBadge status={user.status}>
                    {user.status}
                  </StatusBadge>
                  <span style={{ marginLeft: 'auto' }}>Last: {user.lastActive}</span>
                </DetailRow>
              </UserDetails>

              <UserStats>
                <span>Orders: {user.ordersCount}</span>
                <span>Role: {user.role}</span>
                <span>Status: {user.status}</span>
              </UserStats>
            </UserCard>
          ))}
        </AnimatePresence>
      </UsersList>

      {filteredUsers.length === 0 && (
        <div style={{ textAlign: 'center', marginTop: '2rem', color: '#6b7280' }}>
          No users found matching your criteria.
        </div>
      )}
    </UsersContainer>
  );
}