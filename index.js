//@ts-check
const express = require('express');
const app = express();
const {
    ApolloServer
} = require('apollo-server-express');
const typeDefs = require("./typedefs")
const resolvers = require("./resolvers")
const pool = require("./db")
const cors = require("cors")
const {
    single,
    multiple
} = require('./helpers/dataloader')
const compression = require('compression')
const passport = require('passport')
require('dotenv').config()
// require("./helpers/auth/passport")

//REST ROUTES
const oAuth = require("./helpers/auth/oauth")
const auth = require("./helpers/auth/auth")
const upload = require("./helpers/image-upload/upload")
const email = require("./helpers/emails")

//endpoints
let endpoints = ['http://localhost:3000', 'https://partystore.vercel.app']
app.use(cors({
    origin: endpoints[0],
    credentials: true
}));
// compress all responses
app.use(compression());
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))


app.use(passport.initialize())

//refresh-token and logout routes
app.use("/api", auth)
//image upload route
app.use("/api", upload)
//emails
app.use("/api", email)
//oauth authentication
app.use("/api", oAuth)

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({
        req,
        res
    }) => ({
        req,
        res,
        pool,
        loaderOne: new single(),
        loaderTwo: new multiple()
    }),
});


server.applyMiddleware({
    app,
    cors: false,
    // cors: {
    //     origin: endpoints[1],
    //     credentials: true
    // }
});

const PORT = process.env.NODE_ENV || 4000

app.listen({
        port: PORT
    }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
);