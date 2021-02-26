# Visian API

## Examples

```gql
# If you are testing in the GraphQL playground, click on the gear icon and change:
# `"request.credentials": "omit",` to "request.credentials": "same-origin",

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
  }
}

query {
  currentUser {
    id
    name
  }
}

mutation {
  logOut(input: {}) {
    success
  }
}
```
