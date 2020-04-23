import gql from 'graphql-tag';
import { execute, ServiceDefinitionModule } from '../execution-utils';
import { astSerializer, queryPlanSerializer } from '../../snapshotSerializers';
import * as accounts from '../__fixtures__/schemas/accounts';
import * as books from '../__fixtures__/schemas/books';
import * as inventory from '../__fixtures__/schemas/inventory';
import * as product from '../__fixtures__/schemas/product';
import * as reviews from '../__fixtures__/schemas/reviews';

expect.addSnapshotSerializer(astSerializer);
expect.addSnapshotSerializer(queryPlanSerializer);

it('supports passing additional scalar fields defined by a requires', async () => {
  const query = gql`
    query GetReviwedBookNames {
      me {
        reviews {
          product {
            ... on Book {
              name
            }
          }
        }
      }
    }
  `;

  const { data, queryPlan } = await execute(
    [accounts, books, inventory, product, reviews],
    {
      query,
    },
  );

  expect(data).toEqual({
    me: {
      reviews: [
        { product: {} },
        { product: {} },
        {
          product: {
            name: 'Design Patterns (1995)',
          },
        },
      ],
    },
  });

  expect(queryPlan).toCallService('accounts');
  expect(queryPlan).toCallService('reviews');
  expect(queryPlan).toCallService('product');
  expect(queryPlan).toCallService('books');
});





const serviceA: ServiceDefinitionModule = {
  name: 'serviceA',
  typeDefs: gql`
    type Query {
      me: A
    }
    type A @key(fields: "id") {
      id: ID!
      name: String!
      nested1: Nested1!
      nested2: Nested2!
      nested3: Nested3!
    }
    type Nested1 {
      nameA: String!
      nameB: String!
      nested2: Nested2
    }
    type Nested2 {
      nameA: String!
      nameB: String!
      nameC: String!
      nameD: String!
      nested3: [Nested3!]!
    }
    type Nested3 {
      nameA: String!
      nameB: String!
      nameC: String!
      nameD: String!
      nameE: String!
      nested4: Nested4!
    }
    type Nested4 @key(fields: "id") {
      id: ID!
      nameA: String!
      nameB: String!
      nameC: String!
      nested5: Nested5!
    }
    type Nested5 {
      id: ID!
      nameA: String!
      nameB: String!
    }
  `,
  resolvers: {
    Query: {
      me() {
        return {
          id: '1',
          name: 'name',
          nested1: {
            nameA: "nested1.nameA",
            nameB: "nested1.nameB",
            nested2: {
              nameA: "nested1.nested2.nameA",
              nameB: "nested1.nested2.nameB",
              nameC: "nested1.nested2.nameC",
              nameD: "nested1.nested2.nameD",
              nested3: {
                nameA: "nested1.nested2.nested3.nameA",
                nameB: "nested1.nested2.nested3.nameB",
                nameC: "nested1.nested2.nested3.nameC",
                nameD: "nested1.nested2.nested3.nameD",
                nameE: "nested1.nested2.nested3.nameE",
                nested4: {
                  nameA: "nested1.nested2.nested3.nested4.nameA",
                  nameB: "nested1.nested2.nested3.nested4.nameB",
                  nameD: "nested1.nested2.nested3.nested4.nameC",
                  nested5: {
                    nameA: "nested1.nested2.nested3.nested4.nested5.nameA",
                    nameB: "nested1.nested2.nested3.nested4.nested5.nameB",
                  }
                }
              }
            }
          },
          nested2: {
            nameA: "nested2.nameA",
            nameB: "nested2.nameB",
            nameC: "nested2.nameC",
            nameD: "nested2.nameD",
            nested3: {
              nameA: "nested2.nested3.nameA",
              nameB: "nested2.nested3.nameB",
              nameC: "nested2.nested3.nameC",
              nameD: "nested2.nested3.nameD",
              nameE: "nested2.nested3.nameE",
              nested4: {
                nameA: "nested2.nested3.nested4.nameA",
                nameB: "nested2.nested3.nested4.nameB",
                nameC: "nested2.nested3.nested4.nameC",
                nested5: {
                  nameA: "nested2.nested3.nested4.nested5.nameA",
                  nameB: "nested2.nested3.nested4.nested5.nameB",
                }
              }
            }
          },
          nested3: {
            nameA: "nested3.nameA",
            nameB: "nested3.nameB",
            nameC: "nested3.nameC",
            nameD: "nested3.nameD",
            nameE: "nested3.nameE",
            nested4: {
              nameA: "nested3.nested4.nameA",
              nameB: "nested3.nested4.nameB",
              nameC: "nested3.nested4.nameC",
              nested5: {
                nameA: "nested3.nested4.nested5.nameA",
                nameB: "nested3.nested4.nested5.nameB",
              }
            }
          }
        }
      }
    }
  },
};

const serviceB: ServiceDefinitionModule = {
  name: 'serviceB',
  typeDefs: gql`
    extend type A @key(fields: "id") {
      id: ID! @external
      nested1: Nested1! @external
      nested2: Nested2! @external
      nested3: Nested3! @external
      calculated1: String! @requires(fields: "nested1 { nameA nested2 { nameA } }")
      calculated2: String! @requires(fields: "nested1 { nameB  nested2 { nameB nested3 { nameA } } }")
      calculated3: String! @requires(fields: "nested1 { nested2 { nested3 { nameB } } } nested2 { nameC nested3 { nameC } }")
      calculated4: String! @requires(fields: "nested2 { nameD nested3 { nameD nested4 { nameA } } }")
      calculated5: String! @requires(fields: "nested2 { nested3 { nested4 { nameB nested5 { nameA nameB } } } } nested3 { nameE nested4 { nameC } }")
    }
    type Nested1 {
      nameA: String!
      nameB: String!
      nested2: Nested2
    }
    type Nested2 {
      nameA: String!
      nameB: String!
      nameC: String!
      nameD: String!
      nested3: [Nested3!]!
    }
    type Nested3 {
      nameA: String!
      nameB: String!
      nameC: String!
      nameD: String!
      nameE: String!
      nested4: Nested4!
    }
    extend type Nested4 @key(fields: "id") {
      id: ID! @external
      nameA: String! @external
      nameB: String! @external
      nameC: String! @external
      nested5: Nested5! @external
    }
    type Nested5 {
      id: ID!
      nameA: String!
      nameB: String!
    }
  `,
  resolvers: {
    A: {
      calculated1(parent) {
        return parent.nested1.nameA + ' ' + parent.nested1.nested2.nameA;
      },
      calculated2(parent) {
        return parent.nested1.nameB + ' ' + parent.nested1.nested2.nameB + ' ' + parent.nested1.nested2.nested3.nameA;
      },
      calculated3(parent) {
        return parent.nested1.nested2.nested3.nameB + ' ' + parent.nested2.nameC + ' ' + parent.nested2.nested3.nameC;
      },
      calculated4(parent) {
        return parent.nested2.nameD + ' ' + parent.nested2.nested3.nameD + ' ' + parent.nested2.nested3.nested4.nameA;
      },
      calculated5(parent) {
        return parent.nested2.nested3.nested4.nameB + ' '
          + parent.nested2.nested3.nested4.nested5.nameA + ' '
          + parent.nested2.nested3.nested4.nested5.nameB + ' '
          + parent.nested3.nameA + ' '
          + parent.nested3.nested4.nameC;
      },
    },
  },
};



it('supports multiple arbitrarily nested fields defined by a requires', async () => {
  const query = gql`
    query Me {
      me {
        name
        calculated1
        calculated2
        calculated3
        calculated4
        calculated5
      }
    }
  `;

  const { data, queryPlan } = await execute([serviceA, serviceB], {
    query,
  });

  console.log(data);
  // expect(queryPlan).toMatchInlineSnapshot(`
  //   QueryPlan {
  //     Sequence {
  //       Fetch(service: "user") {
  //         {
  //           me {
  //             name
  //             __typename
  //             id
  //             organization {
  //               name
  //               address {
  //                 country
  //                 city
  //                 city
  //                 coordinates {
  //                   type
  //                   value
  //                   type
  //                   value
  //                 }
  //               }
  //             }
  //           }
  //         }
  //       },
  //       Flatten(path: "me") {
  //         Fetch(service: "publisher") {
  //           {
  //             ... on User {
  //               __typename
  //               id
  //               organization {
  //                 name
  //                 address {
  //                   country
  //                   city
  //                   city
  //                   coordinates {
  //                     type
  //                     value
  //                     type
  //                     value
  //                   }
  //                 }
  //               }
  //             }
  //           } =>
  //           {
  //             ... on User {
  //               publisher {
  //                 id
  //                 name
  //               }
  //               publisherCity
  //             }
  //           }
  //         },
  //       },
  //     },
  //   }
  // `);
});
