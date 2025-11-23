'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  Shield,
  ShieldCheck,
  UserCheck,
  UserX,
  Mail,
  Phone,
  Calendar,
  MoreVertical
} from 'lucide-react';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const AddButton = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background: #ed7734;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(237, 119, 52, 0.2);
  
  &:hover {
    background: #d96929;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0;
`;

const Controls = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid ${props => props.active ? '#ed7734' : '#d1d5db'};
  background: ${props => props.active ? '#ed7734' : 'white'};
  color: ${props => props.active ? 'white' : '#6b7280'};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #ed7734;
    background: ${props => props.active ? '#d96929' : 'rgba(237, 119, 52, 0.05)'};
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled(motion.div)`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(237, 119, 52, 0.1);
`;

const StatIcon = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: ${props => props.color}15;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.color};
  }
`;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const UsersTable = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 0.5fr;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const TableBody = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserRow = styled(motion.div)`
  display: grid;
  grid-template-columns: 2fr 1.5fr 1fr 1fr 1fr 0.5fr;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  align-items: center;
  transition: background 0.2s;
  
  &:hover {
    background: #fafaf9;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ed7734 0%, #f59e0b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
`;

const UserEmail = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ContactInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RoleBadge = styled.div<{ role: string }>`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
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

const StatusBadge = styled.div<{ status: string }>`
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  background: ${props => props.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
  color: ${props => props.status === 'active' ? '#059669' : '#dc2626'};
  text-transform: capitalize;
`;

const DateText = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

const ActionsCell = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  padding: 0.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(237, 119, 52, 0.1);
    color: #ed7734;
  }
`;

const EmptyState = styled.div`
  padding: 4rem 2rem;
  text-align: center;
  color: #6b7280;
`;

const LoadingState = styled.div`
  padding: 4rem 2rem;
  text-align: center;
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

interface UserManagementProps {
  className?: string;
}

export default function UserManagement({ className }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUsers([
        {
          id: '1',
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+1 (555) 123-4567',
          role: 'admin',
          status: 'active',
          joinDate: '2024-01-15',
          lastActive: '2 hours ago',
          ordersCount: 0
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah.j@example.com',
          phone: '+1 (555) 234-5678',
          role: 'manager',
          status: 'active',
          joinDate: '2024-02-20',
          lastActive: '5 hours ago',
          ordersCount: 0
        },
        {
          id: '3',
          name: 'Mike Wilson',
          email: 'mike.w@example.com',
          phone: '+1 (555) 345-6789',
          role: 'driver',
          status: 'active',
          joinDate: '2024-03-10',
          lastActive: '1 day ago',
          ordersCount: 87
        },
        {
          id: '4',
          name: 'Emily Davis',
          email: 'emily.d@example.com',
          phone: '+1 (555) 456-7890',
          role: 'customer',
          status: 'active',
          joinDate: '2024-04-05',
          lastActive: '3 days ago',
          ordersCount: 23
        },
        {
          id: '5',
          name: 'Robert Brown',
          email: 'robert.b@example.com',
          phone: '+1 (555) 567-8901',
          role: 'driver',
          status: 'inactive',
          joinDate: '2024-05-12',
          lastActive: '2 weeks ago',
          ordersCount: 45
        }
      ]);
      setLoading(false);
    }, 1000);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    admins: users.filter(u => u.role === 'admin').length,
    drivers: users.filter(u => u.role === 'driver').length
  };

  return (
    <Container className={className}>
      <Header>
        <TitleRow>
          <Title>User Management</Title>
          <AddButton
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={18} />
            Add New User
          </AddButton>
        </TitleRow>
        <Subtitle>Manage user accounts, roles, and permissions</Subtitle>
      </Header>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatIcon color="#3b82f6">
            <Users />
          </StatIcon>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total Users</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatIcon color="#10b981">
            <UserCheck />
          </StatIcon>
          <StatValue>{stats.active}</StatValue>
          <StatLabel>Active Users</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatIcon color="#dc2626">
            <Shield />
          </StatIcon>
          <StatValue>{stats.admins}</StatValue>
          <StatLabel>Administrators</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <StatIcon color="#ed7734">
            <ShieldCheck />
          </StatIcon>
          <StatValue>{stats.drivers}</StatValue>
          <StatLabel>Drivers</StatLabel>
        </StatCard>
      </StatsGrid>

      <Controls>
        <SearchBar>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>

        <FilterRow>
          <FilterButton
            active={roleFilter === 'all'}
            onClick={() => setRoleFilter('all')}
          >
            All Users
          </FilterButton>
          <FilterButton
            active={roleFilter === 'admin'}
            onClick={() => setRoleFilter('admin')}
          >
            Admins
          </FilterButton>
          <FilterButton
            active={roleFilter === 'manager'}
            onClick={() => setRoleFilter('manager')}
          >
            Managers
          </FilterButton>
          <FilterButton
            active={roleFilter === 'driver'}
            onClick={() => setRoleFilter('driver')}
          >
            Drivers
          </FilterButton>
          <FilterButton
            active={roleFilter === 'customer'}
            onClick={() => setRoleFilter('customer')}
          >
            Customers
          </FilterButton>
        </FilterRow>
      </Controls>

      <UsersTable>
        <TableHeader>
          <div>User</div>
          <div>Contact</div>
          <div>Role</div>
          <div>Status</div>
          <div>Joined</div>
          <div></div>
        </TableHeader>
        
        <TableBody>
          {loading ? (
            <LoadingState>Loading users...</LoadingState>
          ) : filteredUsers.length === 0 ? (
            <EmptyState>No users found</EmptyState>
          ) : (
            filteredUsers.map((user, index) => (
              <UserRow
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <UserInfo>
                  <Avatar>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <UserDetails>
                    <UserName>{user.name}</UserName>
                    <UserEmail>
                      <Mail size={12} />
                      {user.email}
                    </UserEmail>
                  </UserDetails>
                </UserInfo>

                <ContactInfo>
                  <Phone size={14} />
                  {user.phone}
                </ContactInfo>

                <div>
                  <RoleBadge role={user.role}>{user.role}</RoleBadge>
                </div>

                <div>
                  <StatusBadge status={user.status}>
                    {user.status === 'active' ? <UserCheck size={14} /> : <UserX size={14} />}
                    {user.status}
                  </StatusBadge>
                </div>

                <DateText>{new Date(user.joinDate).toLocaleDateString()}</DateText>

                <ActionsCell>
                  <ActionButton title="Edit user">
                    <Edit3 size={16} />
                  </ActionButton>
                  <ActionButton title="Delete user">
                    <Trash2 size={16} />
                  </ActionButton>
                  <ActionButton title="More options">
                    <MoreVertical size={16} />
                  </ActionButton>
                </ActionsCell>
              </UserRow>
            ))
          )}
        </TableBody>
      </UsersTable>
    </Container>
  );
}
