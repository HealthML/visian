# Archimax API

## Examples

```gql
mutation {
  createUser(
    input: { email: "test@example.com", name: "Test User", password: "secret" }
  ) {
    user {
      id
    }
  }
}

mutation {
  logIn(input: { email: "test@example.com", password: "secret" }) {
    user {
      id
    }
    token
  }
}

# Now, set HTTP headers to: { "Authorization": "Bearer <token>" }

query {
  currentUser {
    id
    name
  }
}
```
