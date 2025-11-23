# Quick Reference Guide

**The JERK Tracker X - Developer Quick Reference**

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server (port 3100)
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**Access Points:**
- Home: http://localhost:3100
- Admin: http://localhost:3100/admin
- Sign In: http://localhost:3100/auth/signin

---

## 📁 Key Files & Locations

### Main Application Files
| File | Purpose | Lines |
|------|---------|-------|
| `app/admin/page.tsx` | Admin dashboard with all features | ~1,200 |
| `app/api/auth/[...nextauth]/route.ts` | NextAuth configuration | ~100 |
| `lib/dynamodb.ts` | AWS DynamoDB service | ~400 |
| `middleware.ts` | Route protection | ~50 |

### Settings Components (NEW)
| Component | Purpose | Lines |
|-----------|---------|-------|
| `components/admin/RestaurantSettings.tsx` | Restaurant info & hours | 265 |
| `components/admin/OrderSettings.tsx` | Order configuration | 250 |
| `components/admin/NotificationSettings.tsx` | Notification preferences | 340 |
| `components/admin/UserProfileSettings.tsx` | User account & profile | 300 |
| `components/admin/SystemSettings.tsx` | Theme & system config | 350 |

### Shared UI Components
| Component | Purpose |
|-----------|---------|
| `components/ui/SettingsComponents.tsx` | Settings section & item |
| `components/ui/Switch.tsx` | Toggle switch |
| `components/Toast.tsx` | Notification system |
| `components/Loading.tsx` | Loading states |

---

## 🎨 Component Patterns

### Using Settings Components
```tsx
import RestaurantSettings from '@/components/admin/RestaurantSettings'

<RestaurantSettings
  restaurantInfo={restaurantInfo}
  operatingHours={operatingHours}
  onUpdateInfo={handleUpdateRestaurantInfo}
  onUpdateHours={handleUpdateOperatingHours}
/>
```

### Using Toast Notifications
```tsx
import { useToast } from '@/components/Toast'

const { showToast } = useToast()

showToast('Order saved successfully!', 'success')
showToast('Error saving order', 'error')
showToast('Please review the form', 'warning')
showToast('New feature available', 'info')
```

### Using Styled Components with Transient Props
```tsx
import styled from 'styled-components'

// Use $ prefix for props that shouldn't be passed to DOM
const Button = styled.button<{ $variant?: string }>`
  background: ${props => props.$variant === 'primary' ? '#667eea' : '#ccc'};
`

<Button $variant="primary">Click Me</Button>
```

### Creating a New Settings Section
```tsx
import { SettingsSection, SettingsItem } from '@/components/ui/SettingsComponents'

<SettingsSection title="My Settings" icon={<Icon size={20} />}>
  <SettingsItem 
    label="Setting Name" 
    description="Description of what this does"
  >
    <input type="text" />
  </SettingsItem>
</SettingsSection>
```

---

## 🔑 Environment Variables

**Required:**
```env
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3100
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
```

**Optional (Social Login):**
```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
```

---

## 🎯 Common Tasks

### Adding a New Menu Item
1. Edit `lib/foodItems.ts`
2. Add item to `PRESET_FOOD_ITEMS` array
3. Assign to appropriate category

### Creating a New Order Status
1. Update `lib/dynamodb.ts` - Order interface
2. Update `app/admin/page.tsx` - status handling
3. Update `components/OrderList.tsx` - status badge colors

### Adding a New Admin Tab
1. Add tab to sidebar in `app/admin/page.tsx`
2. Create tab content component
3. Add conditional rendering for `activeTab`

### Customizing Theme Colors
1. Edit `styles/theme.ts`
2. Update color values
3. Restart dev server

---

## 📊 State Management Patterns

### Settings State Example
```tsx
// In app/admin/page.tsx
const [restaurantInfo, setRestaurantInfo] = useState({
  name: 'The JERK Tracker',
  address: '123 Main Street',
  phone: '(555) 123-4567',
  email: 'contact@restaurant.com',
  website: 'https://restaurant.com'
})

// Handler with TODO for persistence
const handleUpdateRestaurantInfo = (info: any) => {
  setRestaurantInfo(info)
  // TODO: Save to backend/localStorage
}
```

### Order State Management
```tsx
const [orders, setOrders] = useState<Order[]>([])

// Load from DynamoDB
useEffect(() => {
  const loadOrders = async () => {
    const ordersFromDB = await DynamoDBService.getAllOrders()
    setOrders(ordersFromDB)
  }
  loadOrders()
}, [])

// Create new order
const handleOrderCreated = async (newOrder: Order) => {
  await DynamoDBService.createOrder(newOrder)
  setOrders([...orders, newOrder])
}
```

---

## 🔧 TypeScript Interfaces

### Order Interface
```typescript
interface Order {
  id: string
  orderNumber: string
  customerName?: string
  status: 'pending' | 'preparing' | 'ready' | 'pickedUp' | 'completed'
  items?: Array<{ name: string; quantity: number; price: number }>
  totalPrice?: number
  createdAt: Date
  updatedAt?: Date
  driverName?: string
  driverCompany?: string
  pickedUpAt?: Date
}
```

### Settings Interfaces
```typescript
interface RestaurantInfo {
  name: string
  address: string
  phone: string
  email: string
  website: string
}

interface OrderConfig {
  defaultStatus: string
  autoCompleteTimer: number
  orderNumberFormat: string
  orderNumberPrefix: string
  enableAutoComplete: boolean
  enableOrderTracking: boolean
}
```

---

## 🎨 Styling Quick Reference

### Colors
```typescript
const colors = {
  primary: '#667eea',
  primaryHover: '#5568d3',
  background: '#fafaf9',
  text: '#1c1917',
  border: '#e5e7eb',
  error: '#dc2626',
  success: '#16a34a',
  warning: '#f59e0b'
}
```

### Breakpoints
```typescript
const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1280px'
}

// Usage in styled-components
@media (max-width: ${breakpoints.mobile}) {
  /* mobile styles */
}
```

### Common Styled Components
```typescript
// Button
const Button = styled.button`
  background: #667eea;
  color: white;
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover { background: #5568d3; }
  &:active { transform: translateY(1px); }
`

// Card
const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`
```

---

## 🐛 Common Issues & Fixes

### Port Already in Use
```bash
# Kill process on port 3100 (Windows)
taskkill /f /im node.exe

# Or use different port
npm run dev -- -p 3200
```

### TypeScript Errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### Environment Variables Not Loading
1. Ensure `.env.local` exists
2. Restart dev server
3. Check variable names (no quotes needed)

### DynamoDB Connection Issues
1. Verify AWS credentials in `.env.local`
2. Check IAM permissions
3. Fallback to localStorage automatically

---

## 📦 Deployment Checklist

- [ ] All environment variables configured
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] Test all main features
- [ ] Check mobile responsiveness
- [ ] Verify authentication works
- [ ] Test order creation/tracking
- [ ] Review settings functionality
- [ ] Update CHANGELOG.md
- [ ] Create git tag for version

---

## 🔗 Useful Links

- **Next.js Docs**: https://nextjs.org/docs
- **Styled Components**: https://styled-components.com
- **NextAuth.js**: https://next-auth.js.org
- **AWS DynamoDB**: https://aws.amazon.com/dynamodb
- **Vercel Deployment**: https://vercel.com/docs

---

## 📞 Need Help?

1. Check [PROJECT-STATUS.md](./docs/PROJECT-STATUS.md) for overview
2. Review [CHANGELOG.md](./CHANGELOG.md) for recent changes
3. See [FEATURES.md](./docs/features/FEATURES.md) for feature details
4. Check [SETTINGS-COMPONENTS.md](./SETTINGS-COMPONENTS.md) for settings docs

---

**Last Updated:** January 12, 2025  
**Version:** 1.2.0
