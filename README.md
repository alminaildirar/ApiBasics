# API Basics 

## 📚 About the Project

Bu proje, Next.js 16 ve React 19 kullanılarak geliştirilmiş bir full-stack blog uygulamasıdır. REST API ve GraphQL ile blog yazıları için CRUD işlemleri, sayfalama ve kullanıcı kimlik doğrulama (JWT, GitHub OAuth) özellikleri uygulanmıştır. Projede temel güvenlik önlemleri ve performans iyileştirmeleri (cache, pagination, lazy loading) kullanılarak modern web geliştirme pratikleri uygulanmıştır.

## ✨ Features

### 🔌 REST API

- **CRUD Operations**: GET, POST, PUT, DELETE methods
- **Endpoints**:
  - `/api/posts` - Blog posts (pagination supported)
  - `/api/posts/[id]` - Single blog post
  - `/api/posts/infinite` - Cursor-based pagination (infinite scroll)
  - `/api/protected/posts` - API key protected endpoints
  - `/api/auth/login` - JWT authentication
  - `/api/auth/register` - User registration
  - `/api/graphql` - GraphQL endpoint

### 🔐 Security

- **JWT Authentication**: Custom JWT implementation (HS256)
- **OAuth2.0**: GitHub OAuth integration (NextAuth)
- **API Keys**: API key validation for protected endpoints

### 🚀 Performance Optimization

- **Caching**: In-memory cache (TTL supported)
- **Pagination**:
  - Offset-based pagination (page numbers)
  - Cursor-based pagination (infinite scroll)
- **Rate Limiting**: IP-based request limiting (100 req/15min)
- **Lazy Loading**: Component code splitting and dynamic imports

### 📡 GraphQL

- **Schema**: Type-safe GraphQL schema definitions
- **Queries**: posts, post
- **Mutations**: createPost, updatePost, deletePost
- **GraphQL Yoga**: Modern GraphQL server

### 🛠️ API Consumption

- **Fetch API**: Native browser API usage
- **Axios**: Interceptors, error handling, token management
- **Context API**: React state management
- **Custom Hooks**: useAuth, usePosts, usePostsAxios

## 🚀 Installation and Running

### Requirements

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Production build
npm run build

# Production server
npm start
```

## 📖 API Usage Examples

### REST API

#### Posts List (Pagination)

```bash
GET /api/posts?page=1&limit=10
```

#### Single Post

```bash
GET /api/posts/1
```

#### Create Post

```bash
POST /api/posts
Content-Type: application/json

{
  "title": "New Blog Post",
  "description": "Description goes here..."
}
```

#### Update Post

```bash
PUT /api/posts/1
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Post

```bash
DELETE /api/posts/1
```

#### Infinite Scroll (Cursor Pagination)

```bash
GET /api/posts/infinite?limit=10
GET /api/posts/infinite?cursor=3&limit=10
```

### GraphQL

#### Query Example

```graphql
query {
  posts(page: 1, limit: 10) {
    posts {
      id
      title
      description
      createdAt
    }
    pagination {
      currentPage
      totalPages
      hasNextPage
    }
  }
}
```

#### Mutation Example

```graphql
mutation {
  createPost(title: "GraphQL Post", description: "GraphQL mutation example") {
    id
    title
    createdAt
  }
}
```

### Authentication

#### JWT Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

#### OAuth (GitHub)

```bash
GET /api/auth/signin/github
```

#### Protected Endpoint (API Key)

```bash
GET /api/protected/posts
X-API-Key: demo-api-key-12345
```
