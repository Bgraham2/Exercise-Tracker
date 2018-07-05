const express = require('express')
const app = express()
const bodyParser = require('body-parser')

const cors = require('cors')

const mongoose = require('mongoose')
mongoose.connect(process.env.MLAB_URI || 'mongodb://localhost/exercise-track', {useMongoClient: true}, console.log("DB connected"))
const Schema = mongoose.Schema;
const userSchema = new Schema({
  userId: {type: String, required: true},
  description: [String],
  duration: [Number],
  date: [Date]
});

const newUser = mongoose.model('newUser', userSchema);

app.use(cors())

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())


app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post('/api/exercise/new-user', (req, res) => {
    var input = new newUser({userId: req.body.username});
    input.save((err) => {
      if(err) {
        return res.send("Error Saving");
      }
    });
}); 

app.post('/api/exercise/add', (req, res) => {
  console.log(req.body);
  newUser.findOneAndUpdate({userId: req.body.userId}, {description: req.body.description, duration: req.body.duration, date: req.body.date}, (err) => {
    if (err) {
      return err;
    }
    res.send("Exc added");
  });
}); 

app.get('/api/exercise/log/:id', (req, res) => {
  console.log(req.params.id);
  newUser.find({userId: req.params.id}, (err, data) => {
    if (err) {
      return err;
    }
    console.log(data);
    res.json({data});
  });
});

// Not found middleware
app.use((req, res, next) => {
  return next({status: 404, message: 'not found'})
})

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage

  if (err.errors) {
    // mongoose validation error
    errCode = 400 // bad request
    const keys = Object.keys(err.errors)
    // report the first validation error
    errMessage = err.errors[keys[0]].message
  } else {
    // generic or custom error
    errCode = err.status || 500
    errMessage = err.message || 'Internal Server Error'
  }
  res.status(errCode).type('txt')
    .send(errMessage)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
