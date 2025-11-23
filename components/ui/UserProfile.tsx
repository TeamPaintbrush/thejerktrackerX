import React, { useState } from 'react'
import styled from 'styled-components'
import Image from 'next/image'
import { User, Camera, Edit3, Trash2 } from 'lucide-react'
import Button from './Button'

interface UserProfileProps {
  user: {
    id: string
    name: string
    email: string
    avatar?: string
    role: string
    joinDate: Date
  }
  onUpdateProfile: (data: any) => void
  onChangePassword: () => void
  onDeleteAccount: () => void
}

const ProfileContainer = styled.div`
  background: #f8fafc;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
`

const AvatarContainer = styled.div`
  position: relative;
  display: inline-block;
`

const Avatar = styled.div<{ hasImage: boolean }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.hasImage ? 'transparent' : '#e5e7eb'};
  color: #9ca3af;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  overflow: hidden;
  border: 3px solid white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  position: relative;
`

const AvatarImage = styled(Image)`
  object-fit: cover;
`;

const CameraButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3b82f6;
  border: 2px solid white;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background: #2563eb;
  }
`

const ProfileInfo = styled.div`
  flex: 1;
  
  h3 {
    margin: 0 0 4px 0;
    font-size: 20px;
    font-weight: 600;
    color: #374151;
  }
  
  .email {
    color: #6b7280;
    font-size: 14px;
    margin-bottom: 4px;
  }
  
  .role {
    display: inline-block;
    background: #dbeafe;
    color: #1e40af;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
    text-transform: capitalize;
  }
`

const ProfileForm = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  
  label {
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }
  
  input {
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    transition: border-color 0.2s;
    
    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 640px) {
    flex-direction: column;
  }
`

const UserProfile: React.FC<UserProfileProps> = ({
  user,
  onUpdateProfile,
  onChangePassword,
  onDeleteAccount
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email
  })

  const handleSave = () => {
    onUpdateProfile(formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user.name,
      email: user.email
    })
    setIsEditing(false)
  }

  return (
    <ProfileContainer>
      <ProfileHeader>
        <AvatarContainer>
          <Avatar hasImage={!!user.avatar}>
            {user.avatar ? (
              <AvatarImage
                src={user.avatar}
                alt={user.name}
                fill
                sizes="80px"
                unoptimized
              />
            ) : (
              <User size={32} color="#9ca3af" />
            )}
          </Avatar>
          <CameraButton onClick={() => console.log('Change avatar')}>
            <Camera size={14} />
          </CameraButton>
        </AvatarContainer>
        
        <ProfileInfo>
          <h3>{user.name}</h3>
          <div className="email">{user.email}</div>
          <span className="role">{user.role}</span>
        </ProfileInfo>
      </ProfileHeader>

      {isEditing ? (
        <>
          <ProfileForm>
            <FormField>
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </FormField>
            <FormField>
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </FormField>
          </ProfileForm>
          
          <ActionButtons>
            <Button onClick={handleSave} variant="primary">
              Save Changes
            </Button>
            <Button onClick={handleCancel} variant="secondary">
              Cancel
            </Button>
          </ActionButtons>
        </>
      ) : (
        <ActionButtons>
          <Button onClick={() => setIsEditing(true)} variant="secondary">
            <Edit3 size={16} />
            Edit Profile
          </Button>
          <Button onClick={onChangePassword} variant="secondary">
            <Edit3 size={16} />
            Change Password
          </Button>
          <Button onClick={onDeleteAccount} variant="danger">
            <Trash2 size={16} />
            Delete Account
          </Button>
        </ActionButtons>
      )}
    </ProfileContainer>
  )
}

export default UserProfile