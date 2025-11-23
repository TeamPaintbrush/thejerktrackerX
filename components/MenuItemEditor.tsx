'use client';

import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { X, Save, Loader, Upload, Image as ImageIcon, Camera } from 'lucide-react';
import { FOOD_CATEGORIES } from '@/lib/foodItems';
import type { MenuItem } from '@/lib/dynamodb';

// Capacitor Camera import with safety check
let CapacitorCamera: any = null;
if (typeof window !== 'undefined') {
  try {
    CapacitorCamera = require('@capacitor/camera').Camera;
  } catch (e) {
    console.log('Capacitor Camera not available');
  }
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
  overflow-y: auto;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    max-height: 95vh;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  
  h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1c1917;
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #78716c;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f5f5f4;
    color: #1c1917;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #44403c;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
  
  &:disabled {
    background: #f5f5f4;
    cursor: not-allowed;
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`;

const Select = styled.select`
  padding: 0.75rem 1rem;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
    cursor: pointer;
    accent-color: #ed7734;
  }
  
  label {
    margin: 0;
    cursor: pointer;
    font-weight: 400;
  }
`;

const TagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid #e7e5e4;
  border-radius: 8px;
  min-height: 46px;
  
  &:focus-within {
    border-color: #ed7734;
    box-shadow: 0 0 0 3px rgba(237, 119, 52, 0.1);
  }
`;

const Tag = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  background: #fef7ee;
  border: 1px solid #fed7aa;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #9a3412;
  
  button {
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    color: #9a3412;
    display: flex;
    align-items: center;
    
    &:hover {
      color: #7c2d12;
    }
  }
`;

const TagInputField = styled.input`
  flex: 1;
  border: none;
  outline: none;
  font-size: 1rem;
  min-width: 120px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  
  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  
  ${props => props.$variant === 'primary' ? `
    background: #ed7734;
    color: white;
    
    &:hover:not(:disabled) {
      background: #dc6627;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(237, 119, 52, 0.3);
    }
  ` : `
    background: white;
    color: #78716c;
    border: 1px solid #e7e5e4;
    
    &:hover:not(:disabled) {
      background: #f5f5f4;
    }
  `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 0.75rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 0.875rem;
`;

const HelpText = styled.p`
  font-size: 0.75rem;
  color: #a8a29e;
  margin: 0;
`;

const ImageUploadArea = styled.div`
  border: 2px dashed #d6d3d1;
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafaf9;

  &:hover {
    border-color: #ed7734;
    background: #fef7ee;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  margin-top: 1rem;
  border-radius: 12px;
  overflow: hidden;
  border: 2px solid #e7e5e4;
`;

const ImagePreview = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  display: block;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UploadIcon = styled.div`
  width: 48px;
  height: 48px;
  margin: 0 auto 0.75rem;
  background: linear-gradient(135deg, #fef7ee 0%, #fed7aa 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ed7734;
`;

const UploadText = styled.p`
  margin: 0 0 0.5rem;
  color: #44403c;
  font-weight: 500;
`;

const UploadHelpText = styled.p`
  margin: 0;
  font-size: 0.75rem;
  color: #a8a29e;
`;

const CameraButtonGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-top: 0.75rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const CameraButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid #e7e5e4;
  border-radius: 8px;
  background: white;
  color: #44403c;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #ed7734;
    color: #ed7734;
    background: #fef7ee;
  }

  &:active {
    transform: scale(0.98);
  }
`;

interface MenuItemEditorProps {
  menuItem?: Partial<MenuItem>;
  businessId: string;
  onSave: (menuItem: Partial<MenuItem>) => Promise<void>;
  onCancel: () => void;
}

const MenuItemEditor: React.FC<MenuItemEditorProps> = ({
  menuItem,
  businessId,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    businessId,
    name: '',
    description: '',
    price: 0,
    category: 'mains',
    customCategory: '',
    image: '',
    popular: false,
    spiceLevel: 'none',
    allergens: [],
    preparationTime: undefined,
    dietary: [],
    availability: {
      isAvailable: true,
      availableDays: [],
      availableTimeSlots: []
    },
    ...menuItem
  });

  const [allergenInput, setAllergenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(menuItem?.image || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAllergenKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const trimmed = allergenInput.trim();
      if (trimmed && !formData.allergens?.includes(trimmed)) {
        setFormData(prev => ({
          ...prev,
          allergens: [...(prev.allergens || []), trimmed]
        }));
        setAllergenInput('');
      }
    }
  };

  const removeAllergen = (allergen: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens?.filter(a => a !== allergen)
    }));
  };

  const handleDietaryToggle = (dietary: string) => {
    setFormData(prev => {
      const current = prev.dietary || [];
      const updated = current.includes(dietary as any)
        ? current.filter(d => d !== dietary)
        : [...current, dietary as any];
      return { ...prev, dietary: updated };
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, JPEG, etc.)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be less than 5MB');
      return;
    }

    // Read file and convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImagePreview(result);
      setFormData(prev => ({ ...prev, image: result }));
      setError(''); // Clear any previous errors
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCameraCapture = async () => {
    // Check if running on mobile with Capacitor Camera
    if (!CapacitorCamera) {
      // Fallback to file input on web
      handleUploadClick();
      return;
    }

    try {
      const { Camera } = await import('@capacitor/camera');
      const { CameraResultType, CameraSource } = await import('@capacitor/camera');

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (image.dataUrl) {
        setImagePreview(image.dataUrl);
        setFormData(prev => ({ ...prev, image: image.dataUrl || '' }));
        setError('');
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      if (error.message !== 'User cancelled photos app') {
        setError('Failed to capture photo. Please try uploading from gallery.');
      }
    }
  };

  const handleGalleryPick = async () => {
    // Check if running on mobile with Capacitor Camera
    if (!CapacitorCamera) {
      // Fallback to file input on web
      handleUploadClick();
      return;
    }

    try {
      const { Camera } = await import('@capacitor/camera');
      const { CameraResultType, CameraSource } = await import('@capacitor/camera');

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
      });

      if (image.dataUrl) {
        setImagePreview(image.dataUrl);
        setFormData(prev => ({ ...prev, image: image.dataUrl || '' }));
        setError('');
      }
    } catch (error: any) {
      console.error('Gallery error:', error);
      if (error.message !== 'User cancelled photos app') {
        setError('Failed to select photo from gallery.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name?.trim()) {
      setError('Please enter an item name');
      return;
    }
    
    if (!formData.price || formData.price <= 0) {
      setError('Please enter a valid price');
      return;
    }
    
    if (!formData.description?.trim()) {
      setError('Please enter a description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save menu item');
      setLoading(false);
    }
  };

  return (
    <Overlay onClick={onCancel}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <h2>{menuItem?.id ? 'Edit Menu Item' : 'Create Menu Item'}</h2>
          <CloseButton onClick={onCancel} type="button">
            <X size={20} />
          </CloseButton>
        </Header>

        <Form onSubmit={handleSubmit}>
          {error && <ErrorMessage>{error}</ErrorMessage>}

          <FormGroup>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., Jerk Chicken Combo"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="description">Description *</Label>
            <TextArea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your menu item..."
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="price">Price * ($)</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0.00"
              required
            />
          </FormGroup>

          <FormGroup>
            <Label htmlFor="category">Category *</Label>
            <Select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              {FOOD_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
              <option value="custom">Custom Category</option>
            </Select>
          </FormGroup>

          {formData.category === 'custom' && (
            <FormGroup>
              <Label htmlFor="customCategory">Custom Category Name</Label>
              <Input
                id="customCategory"
                name="customCategory"
                type="text"
                value={formData.customCategory}
                onChange={handleInputChange}
                placeholder="e.g., Specials, Combos"
              />
            </FormGroup>
          )}

          <FormGroup>
            <Label htmlFor="spiceLevel">Spice Level</Label>
            <Select
              id="spiceLevel"
              name="spiceLevel"
              value={formData.spiceLevel}
              onChange={handleInputChange}
            >
              <option value="none">None</option>
              <option value="mild">🌶️ Mild</option>
              <option value="medium">🌶️🌶️ Medium</option>
              <option value="hot">🌶️🌶️🌶️ Hot</option>
              <option value="extra-hot">🌶️🌶️🌶️🌶️ Extra Hot</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor="preparationTime">Preparation Time (minutes)</Label>
            <Input
              id="preparationTime"
              name="preparationTime"
              type="number"
              min="0"
              value={formData.preparationTime || ''}
              onChange={handleInputChange}
              placeholder="e.g., 15"
            />
          </FormGroup>

          <FormGroup>
            <Label>Item Photo</Label>
            <HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleImageUpload}
            />
            
            {!imagePreview ? (
              <>
                <ImageUploadArea onClick={handleUploadClick}>
                  <UploadIcon>
                    <Upload size={24} />
                  </UploadIcon>
                  <UploadText>Tap to Upload Photo</UploadText>
                  <UploadHelpText>PNG, JPG, JPEG up to 5MB</UploadHelpText>
                </ImageUploadArea>
                
                {CapacitorCamera && (
                  <CameraButtonGroup>
                    <CameraButton type="button" onClick={handleCameraCapture}>
                      <Camera size={18} />
                      Take Photo
                    </CameraButton>
                    <CameraButton type="button" onClick={handleGalleryPick}>
                      <ImageIcon size={18} />
                      Choose from Gallery
                    </CameraButton>
                  </CameraButtonGroup>
                )}
              </>
            ) : (
              <ImagePreviewContainer>
                <ImagePreview src={imagePreview} alt="Menu item preview" />
                <RemoveImageButton onClick={handleRemoveImage} type="button">
                  <X size={20} />
                </RemoveImageButton>
              </ImagePreviewContainer>
            )}
            <HelpText>Upload a photo of your menu item</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>Allergens</Label>
            <TagInput>
              {formData.allergens?.map(allergen => (
                <Tag key={allergen}>
                  {allergen}
                  <button type="button" onClick={() => removeAllergen(allergen)}>
                    <X size={14} />
                  </button>
                </Tag>
              ))}
              <TagInputField
                type="text"
                value={allergenInput}
                onChange={(e) => setAllergenInput(e.target.value)}
                onKeyDown={handleAllergenKeyDown}
                placeholder="Type and press Enter"
              />
            </TagInput>
            <HelpText>Press Enter or comma after each allergen</HelpText>
          </FormGroup>

          <FormGroup>
            <Label>Dietary Options</Label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              {['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'halal', 'kosher'].map(option => (
                <CheckboxGroup key={option}>
                  <input
                    type="checkbox"
                    id={option}
                    checked={formData.dietary?.includes(option as any)}
                    onChange={() => handleDietaryToggle(option)}
                  />
                  <label htmlFor={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1).replace('-', ' ')}
                  </label>
                </CheckboxGroup>
              ))}
            </div>
          </FormGroup>

          <CheckboxGroup>
            <input
              type="checkbox"
              id="popular"
              name="popular"
              checked={formData.popular}
              onChange={handleInputChange}
            />
            <label htmlFor="popular">Mark as Popular Item</label>
          </CheckboxGroup>

          <CheckboxGroup>
            <input
              type="checkbox"
              id="isAvailable"
              checked={formData.availability?.isAvailable}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                availability: {
                  ...prev.availability!,
                  isAvailable: e.target.checked
                }
              }))}
            />
            <label htmlFor="isAvailable">Item is Currently Available</label>
          </CheckboxGroup>

          <ButtonGroup>
            <Button type="button" $variant="secondary" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" $variant="primary" disabled={loading}>
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  {menuItem?.id ? 'Update Item' : 'Create Item'}
                </>
              )}
            </Button>
          </ButtonGroup>
        </Form>
      </Modal>
    </Overlay>
  );
};

export default MenuItemEditor;
