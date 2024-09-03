const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt')
const { default: mongoose } = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json())

dotenv.config({ path: './config.env' });
const PORT = process.env.PORT;

mongoose.connect(process.env.URI).then(() => console.log("MongoDb Conected")).catch(err => console.log(err))

const schema = new mongoose.Schema({
    email:String,
    password:String,
});

const Data = mongoose.model('Data',schema);

app.post('/register', async (req, res) => {
    const data = req.body;
    try {
        const response = await Data.findOne({ email: data.email });
        if (response) {
            return res.status(402).json({ msg: "Email Already exists" });
        }
        else {

            bcrypt.hash(data.password, 10, (error, hashedPassword) => {
                if (hashedPassword) {
                    const newUser = new Data({email:data.email, password: hashedPassword });
                    newUser.save();
                    return res.status(200).json({ msg: "Registered Successfully" });
                }
                else if (error) {
                    console.log(error)
                }
            })
        }
    } catch (error) {
        console.log(error)
    }
});

app.post('/login', async (req, res) => {

    const data = req.body;
    try {
        const response = await Data.findOne({ email: data.email });
        if (response) {

            bcrypt.compare(data.password, response.password, (error, result) => {
                if (result) {
                    res.status(200).json({ msg: "Login Successfull"});
                }
                else {
                    return res.status(402).json({ msg: "Incorrect password" });
                }
            })
        }
        else {
            return res.status(402).json({ msg: "Email is incorrect" });
        }
    } catch (error) {
        console.log(error)
    }

});


app.listen(PORT, () => {
    console.log("Server running on PORT:", PORT);
});