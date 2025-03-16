const port = process.env.PORT || 4000
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const path = require('path')
const cors = require('cors')
const { log } = require('console')

app.use(express.json())
app.use(cors())
const uri = 'mongodb://localhost:27017/cluster0'

// Database connection with MongoDB
mongoose
   .connect(
      'mongodb+srv://monisha2711:moni27@cluster0.ku6he.mongodb.net/e-commerce?retryWrites=true&w=majority&appName=Cluster0',
      {
         useNewUrlParser: true,
         useUnifiedTopology: true,
         tlsAllowInvalidCertificates: true,
      }
   )
   .then(() => console.log('MongoDB Atlas connected successfully'))
   .catch((err) => console.error('MongoDB connection error:', err))

// API Creation
app.get('/', (req, res) => {
   res.send('Express app is running')
})
app.listen(port, (error) => {
   if (!error) {
      console.log('Server listening on port ' + port)
   } else {
      console.log('Error:' + error)
   }
})
// Image storage engine
const storage = multer.diskStorage({
   destination: './upload/images',
   filename: (req, file, cb) => {
      return cb(
         null,
         `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
      )
   },
})
const upload = multer({ storage: storage })

//Creating upload endpoint for images
app.use('/images', express.static('upload/images'))
app.post('/upload', upload.single('product'), (req, res) => {
   res.json({
      success: 1,
      image_url: `http://localhost:${port}/images/${req.file.filename}`,
   })
})
//Schema for creating products
const Product = mongoose.model('Product', {
   id: {
      type: Number,
      required: true,
   },
   name: {
      type: String,
      required: true,
   },
   image: {
      type: String,
      required: true,
   },
   category: {
      type: String,
      required: true,
   },
   new_price: {
      type: Number,
      required: true,
   },
   old_price: {
      type: Number,
      required: true,
   },
   date: {
      type: Date,
      default: Date.now,
   },
   available: {
      type: Boolean,
      default: true,
   },
})
app.post('/addproduct', async (req, res) => {
   let products = await Product.find({})
   let id
   if (products.length > 0) {
      let last_product_array = products.slice(-1)
      let last_product = last_product_array[0]
      id = last_product.id + 1
   } else {
      id = 1
   }
   const product = new Product({
      id: id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
   })
   console.log(product, 123)
   await product.save()
   console.log('Saved')
   res.json({
      success: true,
      name: req.body.name,
   })
})
//creating API for deleting products
app.post('/removeproduct', async (req, res) => {
   await Product.findOneAndDelete({ id: req.body.id })
   console.log('removed')
   res.json({
      success: true,
      name: req.body.name,
   })
})
//creating API for getting all products
app.get('/allproducts', async (req, res) => {
   let products = await Product.find({})
   console.log('All products fetched')
   res.send(products)
})

//Schema creating for user model
const users = mongoose.model('Users', {
   name: {
      type: String,
   },
   email: {
      type: String,
      unique: true,
   },
   password: {
      type: String,
   },
   cartData: {
      type: Object,
   },
   wishList: {
      type: [Number],
      default: [],
   },

   date: {
      type: Date,
      default: Date.now,
   },
})

//Creating endpoint for registering the user

app.post('/signup', async (req, res) => {
   let check = await users.findOne({ email: req.body.email })
   if (check) {
      return res.status(400).json({
         success: false,
         errors: 'Existing user found with same email address',
      })
   }
   let cart = {}
   for (let i = 0; i < 300; i++) {
      cart[i] = 0
   }
   let wishlist = {}
   for (let i = 0; i < 300; i++) {
      wishlist[i] = 0
   }
   const user = new users({
      name: req.body.username,
      email: req.body.email,
      password: req.body.password,
      cartData: cart,
      wishList: wishlist,
   })
   //saving data in DB
   await user.save()

   const data = {
      user: {
         id: user.id,
      },
   }

   const token = jwt.sign(data, 'secret_ecom')
   res.json({ success: true, token })
})

//creating endpoint for user login
app.post('/login', async (req, res) => {
   let user = await users.findOne({ email: req.body.email })
   if (user) {
      const passCompare = req.body.password === user.password
      if (passCompare) {
         const data = {
            user: {
               id: user.id,
            },
         }
         const token = jwt.sign(data, 'secret_ecom')
         res.json({ success: true, token })
      } else {
         res.json({ success: false, errors: 'Wrong Password' })
      }
   } else {
      res.json({ success: false, errors: 'Wrong email ID' })
   }
})

//creating endpoint for new collection data

app.get('/newcollections', async (req, res) => {
   let products = await Product.find({})
   let newcollection = products.slice(1).slice(-8)
   console.log('NewCollection Fetched')
   res.send(newcollection)
})

//creating endpoint for popular in women section
app.get('/popularinwomen', async (req, res) => {
   let products = await Product.find({ category: 'women' })
   console.log(products)

   let popular_in_women = products.slice(0, 4)
   console.log('Popular in women fetched')
   res.send(popular_in_women)
})

//creating middleware to fetch user
const fetchUser = async (req, res, next) => {
   const token = req.header('auth-token')
   if (!token) {
      res.status(401).send({ errors: 'Please authenticate using valid token' })
   } else {
      try {
         const data = jwt.verify(token, 'secret_ecom')
         req.user = data.user
         next()
      } catch (error) {
         res.status(401).send({
            errors: 'Please authenticate using a valid token',
         })
      }
   }
}
//creating endpoint for adding products in cartData
app.post('/addtocart', fetchUser, async (req, res) => {
   let userData = await users.findOne({ _id: req.user.id })
   userData.cartData[req.body.itemId] += 1
   await users.findOneAndUpdate(
      { _id: req.user.id },
      { cartData: userData.cartData }
   )
   res.send('Added')
})

//creating endpoint to remove product from cartdata
app.post('/removefromcart', fetchUser, async (req, res) => {
   let userData = await users.findOne({ _id: req.user.id })
   if (userData.cartData[req.body.itemId] > 0)
      userData.cartData[req.body.itemId] -= 1
   await users.findOneAndUpdate(
      { _id: req.user.id },
      { cartData: userData.cartData }
   )
   res.send('Removed')
})

//creating endpoint to get cartData
app.post('/getcart', fetchUser, async (req, res) => {
   let userData = await users.findOne({ _id: req.user.id })
   res.json(userData.cartData)
})

//creating endpoint to get wishlist data
app.post('/addtowishlist', fetchUser, async (req, res) => {
   let userData = await users.findOne({ _id: req.user.id })

   if (!userData.wishList.includes(req.body.itemId)) {
      userData.wishList.push(req.body.itemId)
      await users.findOneAndUpdate(
         { _id: req.user.id },
         { wishList: userData.wishList }
      )
      res.json({ success: true, message: 'Item added to wishlist' })
   } else {
      res.json({ success: false, message: 'Item already in wishlist' })
   }
})

app.post('/removefromwishlist', fetchUser, async (req, res) => {
   let userData = await users.findOne({ _id: req.user.id })

   userData.wishList = userData.wishList.filter((id) => id !== req.body.itemId)
   await users.findOneAndUpdate(
      { _id: req.user.id },
      { wishList: userData.wishList }
   )

   res.json({ success: true, message: 'Item removed from wishlist' })
})
app.post('/getwishlist', fetchUser, async (req, res) => {
   let userData = await users.findOne({ _id: req.user.id })

   if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' })
   }

   res.json({ success: true, wishList: userData.wishList })
})
