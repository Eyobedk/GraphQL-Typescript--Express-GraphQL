import express, { Express, Request, Response } from "express";
import { graphqlHTTP } from "express-graphql";
import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLSchema, GraphQLString } from 'graphql'

const app: Express = express();

const port: number = 3000;

interface webFields {
    id: number,
    name: string,
    ownerId: number
}
interface ownerFields {
    id: number,
    name: string
}

var Owners: Array<ownerFields> = [
    { id: 1, name: "bamlak" },
    { id: 2, name: "eyobed" },
    { id: 3, name: "zerihun" },
]


var Websites: Array<webFields> = [
    { id: 1, name: 'Facebook', ownerId: 1 },
    { id: 1, name: 'Google', ownerId: 2 },
    { id: 1, name: 'Amazon', ownerId: 3 },
    { id: 1, name: 'Github', ownerId: 1 },
    { id: 1, name: 'Medium', ownerId: 2 }
];

const websiteOptions: any =
{
    name: "website",
    description: "This represents a website made by an Owner",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        ownerId: { type: new GraphQLNonNull(GraphQLInt) }
    })
}
const ownerOptions: any =
{
    name: "Owner",
    description: "This represents an Owner",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: new GraphQLNonNull(GraphQLString) },
    })
}


const websiteType: GraphQLObjectType = new GraphQLObjectType(websiteOptions)
const ownerType: GraphQLObjectType = new GraphQLObjectType(ownerOptions);

const RootType: GraphQLObjectType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        websites: {
            type: new GraphQLList(websiteType),
            description: "List of All websites",
            resolve: () => Websites
        },
        owners: {
            type: new GraphQLList(ownerType),
            description: "List of All Owners",
            resolve: () => Owners
        },
        website: {
            type: websiteType,
            description: "A single website",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => Websites.find(website => website.id === args.id)
        },
        owner: {
            type: ownerType,
            description: "A single Owner",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => Owners.find(owner => owner.id === args.id)
        }
    })
});


const RootMutationType: GraphQLObjectType = new GraphQLObjectType({
    name: 'Muation',
    description: "Root Mutation",
    fields: () => ({
        addWebsite: {
            type: websiteType,
            description: "Add a website",
            args: {
                name: { type: new GraphQLNonNull(GraphQLString) },
                ownerId: { type: new GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const website = { id: Websites.length + 1, name: args.name, ownerId: args.ownerId };
                Websites.push(website)
                return website
            }

        },
        removeWebsite: {
            type: websiteType,
            description: "Remove a single website",
            args: { id: { type: GraphQLInt } },
            resolve: (parent, args) => {
                Websites = Websites.filter(Website => Website.id != args.id)
                return Websites[args.id]
            }
        },
        updateWebsite: {
            type: websiteType,
            description: "update single website",
            args: {
                id: { type: GraphQLInt },
                name: { type: GraphQLString },
                ownerId: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                Websites[args.id - 1].name = args.name;
                Websites[args.id - 1].ownerId = args.ownerId;
                return Websites[args.id - 1];
            }
        },
        addOwner: {
            type: ownerType,
            description: "Add owner",
            args: {
                id: { type: GraphQLInt },
                name: { type: GraphQLString }
            },
            resolve: (parent, args) => {
                const owner = { id: args.id, name: args.name };
                Owners.push(owner);
                return owner;
            }
        },
        removeOwner: {
            type: ownerType,
            description: "remove owner",
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => {
                Owners = Owners.filter(owner => owner.id !== args.id);
                return Owners[args.id];
            }
        },
        updateOwner: {
            type: ownerType,
            description: "update single owner",
            args: {
                id: { type: GraphQLInt },
                name: { type: GraphQLString }
            },
            resolve: (parent, args) => {
                Owners[args.id - 1].name = args.name;
                return Owners[args.id - 1];
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootType,
    mutation: RootMutationType
})

app.use('/graphql', graphqlHTTP({
    graphiql: true,
    schema: schema
}
));

app.listen(port, () => {
    console.log("app is listneing on port", port);
})