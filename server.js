const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const colors = require("colors");
const cookieParser = require("cookie-parser");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");
const errorHandler = require("./middleware/error");
const connectDB = require("./config/db");
const http = require("http");
const socketUtils = require("./utils/socketUtils");
const macaddress = require("macaddress");

//load env vars
dotenv.config({ path: "./config/config.env" });
// dotenv.config({ path: "./config/devops.env" });

//connect to database
connectDB();

// Routes Files

const frontdesk = require("./routes/frontdesk");
const employee = require("./routes/employee");
const newGuest = require("./routes/newGuest");
const oldGuest = require("./routes/oldGuest");
const prebook = require("./routes/prebook");
const log = require("./routes/logs");

const app = express();

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//Boy Parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const i = http.createServer(app);

const io = socketUtils.sio(i);
socketUtils.connection(io);

const socketIOMiddleware = (req, res, next) => {
  req.io = io;

  next();
};
// app.use(socketIOMiddleware());

// app.use("/api/v1/hello", socketIOMiddleware, (req, res) => {
//   req.io.emit("message", `Hello, ${req.originalUrl}`);

// });

//enable CORS
app.use(cors());

//Sanitize data
app.use(mongoSanitize());

//set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

//Rate limiting
const limiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 mins
  max: 300,
});
app.use(limiter);

//prevent http param pollution
app.use(hpp());

//Mount Routers

//Mount Routers
app.use("/api/v1/frontdesk", frontdesk);
app.use("/api/v1/staff", employee);
app.use("/api/v1/guest", newGuest);
app.use("/api/v1/returning", socketIOMiddleware, oldGuest);
app.use("/api/v1/prebook", prebook);
app.use("/api/v1/log", log);

app.use(errorHandler);

macaddress.one(function (err, mac) {
  if (mac !== "e4:a4:71:dc:b0:8b") {
    console.log("Application is running");
  } else {
    //Set static folder
    app.use(express.static(path.join(__dirname, "public")));
    app.get("/*", function (req, res) {
      res.sendFile(path.join(__dirname, "public/index.html"), function (err) {
        if (err) {
          res.status(500).send(err);
        }
      });
    });
  }
});

const PORT = process.env.PORT || 8000;

const server = i.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
  )
);

//Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // close Server & exit Process

  server.close(() => process.exit(1));
});
