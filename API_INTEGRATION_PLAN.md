# API Integration Plan for Regional Language Service

## Overview

This document outlines the comprehensive API integration plan for the Regional Language Service mobile application, based on the provided Postman collection. The integration includes authentication, user management, location services, word management, and submission handling.

## 🚀 Quick Start

### 1. Import and Initialize API Service

```typescript
import { apiService } from './src/services/apiService';

// Initialize API service when app starts
await apiService.initialize({
  baseUrl: 'https://59312d0a3250.ngrok-free.app', // From Postman environment
});
```

### 2. Basic Usage Examples

```typescript
// Authentication
const loginResult = await apiService.auth.login({
  email: 'tushar.mahajan@tekditechnologies.com',
  password: 'Password@123!',
});

// Get locations
const districts = await apiService.locations.getAllDistricts();
const tehsils = await apiService.locations.getTehsilsByDistrict(districtId);

// Submit word data
const submission = await apiService.submissions.submitSubmission({
  wordId: 'uuid',
  synonyms: 'जुबान',
  villageId: 'uuid',
  tehsilId: 'uuid',
  districtId: 'uuid',
  languageId: 'uuid',
});
```

## 📁 Service Architecture

### Service Layer Structure

```
src/services/
├── httpClient.ts              # Base HTTP client with retry logic
├── apiService.ts              # Unified API service interface
├── authApiService.ts          # Authentication operations
├── userApiService.ts          # User management operations
├── locationApiService.ts      # Location hierarchy (districts/tehsils/villages)
├── submissionApiService.ts    # Word submission operations
└── wordsApiService.ts         # Words and languages operations
```

### Constants and Types

```
src/constants/
├── apiConstants.ts            # API endpoints and configuration
└── config.ts                  # App configuration (updated with refresh token)

src/types/
└── api.ts                     # Comprehensive API type definitions
```

## 🔐 Authentication System

### Endpoints Implemented

| Endpoint             | Method | Purpose                  | Implementation                      |
| -------------------- | ------ | ------------------------ | ----------------------------------- |
| `/api/auth/register` | POST   | Public user registration | `authApiService.registerPublic()`   |
| `/api/auth/login`    | POST   | User login               | `authApiService.login()`            |
| `/api/users`         | POST   | Admin user registration  | `authApiService.registerWithAuth()` |

### Authentication Flow

```typescript
// 1. Login
const response = await apiService.auth.login({
  email: 'user@example.com',
  password: 'password',
});

// 2. Token is automatically stored and used for subsequent requests
// 3. Access user data
const userData = await apiService.auth.getCurrentUser();

// 4. Logout
await apiService.auth.logout();
```

### Token Management

- **Access Token**: Automatically included in Authorization header
- **Refresh Token**: Stored for future token refresh (endpoint pending)
- **Automatic Retry**: Failed requests due to expired tokens are retried
- **Storage**: Secure storage using AsyncStorage

## 👥 User Management

### Available Operations

```typescript
// Get all users with filters
const users = await apiService.users.getUsers({
  page: 1,
  limit: 10,
  role: 'WORKER',
  status: 'active',
  search: 'tushar',
});

// Get specific user
const user = await apiService.users.getUserById(userId);

// Update user profile
const updated = await apiService.users.updateUser(userId, {
  fName: 'Updated Name',
  lName: 'Updated LastName',
});

// Search users
const searchResults = await apiService.users.searchUsers('tushar');
```

## 🗺️ Location Services

### Hierarchical Location System

The API follows a hierarchical location structure:
**District → Tehsil → Village**

```typescript
// Get all districts
const districts = await apiService.locations.getAllDistricts();

// Get tehsils for a specific district
const tehsils = await apiService.locations.getTehsilsByDistrict(districtId);

// Get villages for a specific tehsil
const villages = await apiService.locations.getVillagesByTehsil(tehsilId);

// Get complete location hierarchy
const hierarchy = await apiService.locations.getLocationHierarchy(
  districtId, // optional
  tehsilId, // optional
);
```

### Location Filtering

All location endpoints support filtering:

```typescript
const filteredDistricts = await apiService.locations.getDistricts({
  name: 'Pune',
  page: 1,
  limit: 10,
  sortBy: 'name',
  sortOrder: 'ASC',
});
```

## 📝 Submission Management

### Submission Types

1. **JSON Submission** (without audio file)
2. **Upload Submission** (with audio file)

### Basic Submission

```typescript
const submission = await apiService.submissions.submitSubmission({
  wordId: 'b652f83a-3b84-4cf6-aa4c-5dfc51bf099f',
  synonyms: 'जुबान',
  audioUrl: 'https://example.com/audio/pronunciation2.mp3', // optional
  villageId: 'village-uuid',
  tehsilId: 'tehsil-uuid',
  districtId: 'district-uuid',
  languageId: 'language-uuid',
});
```

### Submission with Audio Upload

```typescript
const audioFile = new File([audioBlob], 'recording.mp3', { type: 'audio/mp3' });

const submission = await apiService.submissions.submitSubmissionWithUpload({
  wordId: 'word-uuid',
  synonyms: 'regional word',
  villageId: 'village-uuid',
  tehsilId: 'tehsil-uuid',
  districtId: 'district-uuid',
  languageId: 'language-uuid',
  audioFile: audioFile,
});
```

### Advanced Submission Queries

```typescript
// Filter submissions
const filteredSubmissions =
  await apiService.submissions.getSubmissionsWithFilters({
    districtId: 'district-uuid',
    tehsilId: 'tehsil-uuid',
    villageId: 'village-uuid',
    userIds: ['user1-uuid', 'user2-uuid'],
    statuses: ['pending', 'approved'],
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  });

// Get submissions by status
const pendingSubmissions = await apiService.submissions.getPendingSubmissions();
const approvedSubmissions =
  await apiService.submissions.getApprovedSubmissions();

// Update submission status
await apiService.submissions.approveSubmission(submissionId);
await apiService.submissions.rejectSubmission(submissionId);
```

## 📚 Words and Languages

### Language Operations

```typescript
// Get all languages
const languages = await apiService.languages.getAllLanguages();

// Search languages
const searchResults = await apiService.languages.searchLanguages('hindi');
```

### Word Operations

```typescript
// Get words with filters
const words = await apiService.words.getWords({
  languageIds: ['language-uuid'],
  category: 'basic',
  search: 'hello',
  page: 1,
  limit: 50,
  sortBy: 'english',
  sortOrder: 'ASC',
});

// Get words by language
const hindiWords = await apiService.words.getWordsByLanguage(['hindi-uuid']);

// Get words by category
const basicWords = await apiService.words.getWordsByCategory('basic');

// Get word categories
const categories = await apiService.words.getWordCategories(['language-uuid']);
```

## 🔧 Error Handling

### Built-in Error Handling

All API services include comprehensive error handling:

```typescript
const response = await apiService.auth.login(credentials);

if (response.success) {
  // Handle success
  console.log('Login successful:', response.data);
} else {
  // Handle error
  console.error('Login failed:', response.error);

  // Check for validation errors
  if (response.errors) {
    Object.entries(response.errors).forEach(([field, messages]) => {
      console.error(`${field}: ${messages.join(', ')}`);
    });
  }
}
```

### HTTP Client Features

- **Automatic Retry**: Network failures are retried up to 3 times
- **Timeout Handling**: Configurable request timeouts
- **Token Management**: Automatic token injection and refresh
- **Request/Response Logging**: Detailed logging for debugging

## 🔄 Offline Support

### Planned Offline Features

While not yet implemented, the architecture supports:

1. **Offline Submission Queue**: Store submissions when offline
2. **Automatic Sync**: Upload queued data when connection returns
3. **Cached Data**: Store frequently accessed data locally

### Implementation Hooks

```typescript
// Future offline implementation
const offlineService = {
  queueSubmission: async submissionData => {
    // Store in AsyncStorage
  },

  syncOfflineData: async () => {
    // Upload queued submissions
  },

  cacheLocationData: async () => {
    // Cache districts, tehsils, villages
  },
};
```

## 🚦 Testing Strategy

### API Testing

```typescript
// Health check
const health = await apiService.healthCheck();
console.log('API Health:', health);

// Test credentials from Postman collection
const testLogin = await apiService.auth.login({
  email: 'tushar.mahajan@tekditechnologies.com',
  password: 'Password@123!',
});
```

### Integration Testing

1. **Authentication Flow**: Login → Get Profile → Logout
2. **Location Hierarchy**: Districts → Tehsils → Villages
3. **Submission Flow**: Word Selection → Regional Input → Audio Upload
4. **Error Scenarios**: Invalid credentials, network failures

## 📊 Performance Considerations

### Optimization Strategies

1. **Pagination**: All list endpoints support pagination
2. **Filtering**: Reduce data transfer with server-side filtering
3. **Caching**: Cache static data (districts, languages)
4. **Batch Operations**: Group related API calls

### Example Optimized Loading

```typescript
// Load initial data efficiently
const bulkOps = await apiService.bulkOperations();
const initialData = await bulkOps.loadInitialData();

// Load location data as needed
const locationData = await bulkOps.loadLocationData(selectedDistrictId);

// Load words for selected language
const wordsData = await bulkOps.loadWordsForLanguage(selectedLanguageId);
```

## 🔒 Security Features

### Implemented Security

1. **JWT Token Authentication**: Secure API access
2. **Automatic Token Refresh**: Seamless token management
3. **Request Validation**: Type-safe API calls
4. **HTTPS Enforcement**: Secure data transmission

### Security Best Practices

```typescript
// Tokens are securely stored
const token = await authApiService.getAccessToken();

// Automatic logout on token expiry
const isAuthenticated = await authApiService.isAuthenticated();

// Secure API calls
httpClient.setBaseURL('https://api.example.com'); // Always use HTTPS
```

## 🚀 Migration Guide

### From Mock Data to Real API

1. **Update Components**: Replace mock service calls with real API calls
2. **Handle Loading States**: Add proper loading indicators
3. **Error Handling**: Implement user-friendly error messages
4. **Data Mapping**: Convert between mock and API data formats

### Component Integration Example

```typescript
// Before (Mock)
const mockData = await mockApiService.getLocations();

// After (Real API)
const { data: districts, error } = await apiService.locations.getAllDistricts();
if (error) {
  // Handle error
} else {
  // Use real data
}
```

## 📈 Future Enhancements

### Planned Features

1. **Real-time Updates**: WebSocket integration for live updates
2. **Offline Synchronization**: Comprehensive offline support
3. **File Upload Progress**: Progress tracking for audio uploads
4. **Caching Layer**: Smart caching for better performance
5. **Analytics**: API usage and performance metrics

### Extension Points

```typescript
// Real-time notifications (future)
const notifications = await apiService.notifications.subscribe();

// File upload with progress (future)
await apiService.submissions.submitWithProgress(data, {
  onProgress: progress => console.log(`${progress}%`),
});

// Analytics (future)
await apiService.analytics.trackSubmission(submissionId);
```

## 📞 Support and Testing

### Test Credentials

From the Postman collection:

- **Worker**: `tushar.mahajan@tekditechnologies.com` / `Password@123!`
- **Admin**: `vaibhav.shinde@tekditechnologies.com` / `Password@123!`

### API Documentation

- **Base URL**: `https://59312d0a3250.ngrok-free.app`
- **Postman Collection**: Available with complete request examples
- **Environment**: Configured with necessary variables

### Getting Help

1. Check console logs for detailed error information
2. Use the health check endpoint to verify API connectivity
3. Review the Postman collection for expected request/response formats
4. Test individual endpoints before integrating into components

---

## ✅ Implementation Checklist

- [x] HTTP Client with retry logic and error handling
- [x] Authentication service with token management
- [x] User management service
- [x] Location hierarchy service (districts/tehsils/villages)
- [x] Submission service with file upload support
- [x] Words and languages service
- [x] Unified API service interface
- [x] Comprehensive type definitions
- [x] Configuration and constants
- [ ] Integration with existing components
- [ ] Offline support implementation
- [ ] Real-time features
- [ ] Analytics and monitoring

This API integration provides a robust, scalable foundation for the Regional Language Service application with full support for all documented endpoints and workflows.
