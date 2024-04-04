import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import pg from "pg";
import bcrypt, { hash } from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import env from "dotenv";

const app = express();
const saltRounds = 10;
env.config();

//sequence app.use
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set("view engine", "ejs");
app.set("views", "./views");
app.use(express.static("public"));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

// Passport middleware initialization
app.use(passport.initialize());
app.use(passport.session());

//use mongoDB
mongoose.set("strictQuery", false);

const connectionParams = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
};

mongoose.connect(process.env.MONGO_DB_URL, connectionParams);

const postsSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
});

const Post = mongoose.model("Post", postsSchema);

//use PostgreSQL
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

db.connect()
  .then(() => {
    console.log("Connected to PostgreSQL database");
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL:", err.message);
  });

// Save a default post if needed
const post1 = new Post({
  title: "The Rise of Decentralized Finance",
  content:
    "Decentralized Finance (DeFi) is an emerging and rapidly evolving field in the blockchain industry. It refers to the shift from traditional, centralized financial systems to peer-to-peer finance enabled by decentralized technologies built on Ethereum and other blockchains. With the promise of reduced dependency on the traditional banking sector, DeFi platforms offer a wide range of services, from lending and borrowing to insurance and trading.",
  author: "Alex Thompson",
});

const post2 = new Post({
  title: "The Impact of Artificial Intelligence on Modern Businesses",
  content:
    "Artificial Intelligence (AI) is no longer a concept of the future. It's very much a part of our present, reshaping industries and enhancing the capabilities of existing systems. From automating routine tasks to offering intelligent insights, AI is proving to be a boon for businesses. With advancements in machine learning and deep learning, businesses can now address previously insurmountable problems and tap into new opportunities.",
  author: "Mia Williams",
});

const defaultPosts = [post1, post2];

// Save default posts if they don't exist
app.get("/post/:postId", async (req, res) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.render("post", { post: post }); // Render the 'post' template with the full post content
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Asynchronous function to save default posts
const saveDefaultPosts = async () => {
  try {
    for (const post of defaultPosts) {
      const foundPost = await Post.findOne({ title: post.title });
      if (!foundPost) {
        const savedPost = await post.save();
        console.log("Default post saved successfully:", savedPost);
      }
    }
  } catch (error) {
    console.error("Error saving default posts:", error);
  }
};

// Call the function to save default posts
saveDefaultPosts();

// defaultPosts.forEach((post) => {
//   Post.findOne({ title: post.title }, (err, foundPost) => {
//     if (!foundPost) {
//       post.save((err, savedPost) => {
//         if (err) {
//           console.error("Error saving default post:", err);
//         } else {
//           console.log("Default post saved successfully:", savedPost);
//         }
//       });
//     }
//   });
// });

app.get("/contact", async (req, res) => {
  try {
    // Fetch all posts
    const posts = await Post.find({});
    // Rendering the contact page with posts and post1
    res.render("contact", {
      posts: posts,
    });
  } catch (error) {
    // Handle errors
    res.status(500).send("Internal Server Error");
  }
});

app.get("/compose", function (req, res) {
  res.render("compose");
});

app.post("/compose", function (req, res) {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
    author: req.body.postAuthor,
  });

  post
    .save()
    .then(() => {
      console.log("Post saved successfully");
      res.redirect("/contact");
    })
    .catch((err) => {
      res.status(400).send("unable to save post to database");
    });
});

app.get("/posts/:postId", (req, res) => {
  const requestedPostId = req.params.postId;

  Post.findOne({ _id: requestedPostId }, (err, post) => {
    res.render("post", {
      title: post.title,
      content: post.content,
      author: post.author,
    });
  });
});

//route
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/destinations", (req, res) => {
  res.render("destinations");
});

app.get("/destinations/pasir_padi", (req, res) => {
  res.render("sites/pasir_padi");
});
app.get("/destinations/parai", (req, res) => {
  res.render("sites/parai");
});

app.get("/destinations/batudinding", (req, res) => {
  res.render("sites/batu_dinding");
});

app.get("/destinations/matras", (req, res) => {
  res.render("sites/matras");
});

app.get("/destinations/tongaci", (req, res) => {
  res.render("sites/tongaci");
});

app.get("/destinations/koalin", (req, res) => {
  res.render("sites/koalin");
});

app.get("/destinations/puritriagung", (req, res) => {
  res.render("sites/puritriagung");
});

app.get("/destinations/penyusukbeach", (req, res) => {
  res.render("sites/penyusukbeach");
});

app.get("/destinations/tanjungkalian", (req, res) => {
  res.render("sites/tanjungkalian");
});

app.get("/destinations/tanjungkelayang", (req, res) => {
  res.render("sites/tanjungkelayang");
});

app.get("/destinations/lengkuas", (req, res) => {
  res.render("sites/lengkuas");
});

app.get("/destinations/batuberlayar", (req, res) => {
  res.render("sites/batuberlayar");
});

app.get("/destinations/tanjungtinggi", (req, res) => {
  res.render("sites/tanjungtinggi");
});

app.get("/destinations/burong", (req, res) => {
  res.render("sites/burong");
});

app.get("/destinations/diving", (req, res) => {
  res.render("sites/diving");
});

app.get("/destinations/:travel", (req, res) => {
  const travel = req.params.travel;
  res.render(`${travel}`);
});

app.get("/culinary", (req, res) => {
  res.render("culinary");
});

app.get("/culinary/bakmi", (req, res) => {
  res.render("main_dish/bakmi");
});

app.get("/culinary/otak_otak", (req, res) => {
  res.render("main_dish/otak_otak");
});

app.get("/culinary/seafood", (req, res) => {
  res.render("main_dish/seafood");
});

app.get("/culinary/uniquefood", (req, res) => {
  res.render("main_dish/uniquefood");
});

app.get("/culinary/others", (req, res) => {
  res.render("main_dish/others");
});
app.get("/culinary/snacks", (req, res) => {
  res.render("main_dish/snacks");
});
app.get("/culinary/:dish", (req, res) => {
  const dish = req.params.dish;
  res.render(`${dish}`);
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/hotel", (req, res) => {
  res.render("hotel");
});

app.get("/transport", (req, res) => {
  res.render("transport");
});

//Authentication
app.get("/signin", (req, res) => {
  res.render("signin");
});

app.get("/signin/login", (req, res) => {
  res.render("login");
});

app.get("/signin/register", (req, res) => {
  res.render("register");
});
app.get("/signin/:sign", (req, res) => {
  const sign = req.params.sign;
  res.render(`${sign}`);
});

app.get("/contact", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("contact");
  } else {
    res.redirect("/signin");
  }
});

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);
app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/contact",
    failureRedirect: "/signin",
  })
);

// app.get(
//   "/auth/google/myblog",
//   passport.authenticate("google", {
//     successRedirect: "/contact",
//     failureRedirect: "/signin/login",
//   })
// );

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      res.redirect("/contact");
    }
  });
});

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      //password Hashing
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log("Error hashing pasword", err);
        } else {
          const result = await db.query(
            "INSERT INTO users (email,password) VALUES ($1,$2)",
            [email, hash] //change password - hash
          );
          res.redirect("/contact");
        }
      });
    }
  } catch (err) {
    // Handle errorsmyblog
    res.status(500).send("Internal Server Error");
  }
});

app.post("/login", async (req, res) => {
  const email = req.body.username;
  const loginpassword = req.body.password;

  res.render("/contact");
});

// Define Passport strategy
passport.use(
  "local",
  new Strategy(async (username, password, done) => {
    try {
      const result = await db.query("SELECT * FROM users WHERE email=$1", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storeHashedPassword = user.password;
        // Compare passwords
        bcrypt.compare(password, storeHashedPassword, (err, result) => {
          if (err) {
            return done(err);
          } else {
            if (result) {
              return done(null, user);
            } else {
              return done(null, false);
            }
          }
        });
      } else {
        return done(null, false);
      }
    } catch (err) {
      return done(err);
    }
  })
);

passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/myblog",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log(profile);
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.email,
        ]);
        if (result.rows.length === 0) {
          const newUser = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2)",
            [profile.email, "google"]
          );
          return done(null, newUser.rows[0]);
        } else {
          return done(null, result.rows[0]);
        }
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Serialize and deserialize user for session management
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log(`Server started on port{port}`);
});
