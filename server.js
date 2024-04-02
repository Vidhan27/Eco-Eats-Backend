const express = require('express');
const app = express();
const cors = require('cors');
const allowedOrigins = ['http://localhost:5173', 'https://eco-eats-backend.vercel.app/'];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      // Allow requests from the specified origins
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow sending cookies and other credentials
  })
);

const passport = require('passport');
const flash = require('connect-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const authRoutes = require('./routes/auth');
const donorRoutes = require('./routes/donor');
const agentRoutes = require('./routes/agent');

require("dotenv").config();
require("./config/dbConnection.js")();
require('./config/passport')(passport);


app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: true, // set this to true if you're using HTTPS
        sameSite: 'none', // set this to 'none' if your frontend and backend are on different domains
        httpOnly: true, // set this to true to prevent client-side JavaScript from accessing the cookie
    }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(methodOverride('_method'));
app.use((req,res,next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.warning = req.flash('warning');
    res.locals.currentUser = req.user;
    next();
});

//Routes
app.get('/', (req, res) => {
    res.send("Hello");
});
app.use('/api',authRoutes);
app.use('/api',donorRoutes);
app.use('/api',agentRoutes)

app.use((req,res)=>{
    res.status(404).json({message:"Page not found"});
});

const port = process.env.PORT || 4000;
app.listen(port,console.log(`Server is running on port ${port}`));
