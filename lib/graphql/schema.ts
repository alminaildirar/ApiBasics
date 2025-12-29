export const typeDefs = `
  type BlogPost {
    id: ID!
    title: String!
    description: String!
    createdAt: String!
  }

  type PaginationMeta {
    currentPage: Int!
    itemsPerPage: Int!
    totalPages: Int!
    totalItems: Int!
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
  }

  type PostsResponse {
    posts: [BlogPost!]!
    pagination: PaginationMeta
  }

  type Query {
    posts(page: Int, limit: Int): PostsResponse!
    post(id: ID!): BlogPost
  }

  type Mutation {
    createPost(title: String!, description: String!): BlogPost!
    updatePost(id: ID!, title: String, description: String): BlogPost
    deletePost(id: ID!): Boolean!
  }
`;
