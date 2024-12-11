const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
require('dotenv').config
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;


const e = require('express')

app.use(express.json())

const users = []
const sms = []

app.get('/users', (req, res) =>{
    res.json(users)
})

app.get('/sms', (req, res) =>{
    res.json(sms)
})


app.post('/users', async (req, res) => {
    try{
        
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = {name: req.body.name, password: hashedPassword, phoneNumber: req.body.phoneNumber}
        users.push(user)
        res.status(201).send()
    }
    catch{
        res.status(500).send()
    }
})

app.post('/users/login', async (req, res) => {
    const user = users.find(users => users.name === req.body.name)
    if(user == null){
        return res.status(400).send('Cannot find user')
    }
    try{
       if(await bcrypt.compare(req.body.password, user.password))
       {
        res.send('success')
        const code = Math.floor(Math.random() * 10000)
        const smsCode = {name: user.name, otp: code}
        sms.push(smsCode)
        code = "Your code is: " + code.toString()
        phoneNumber = users.phoneNumber
        subject = "SMSCode"
        //Begin sms message query here
        const client = require('twilio')(accountSid, authToken);
        client.message.create({
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phoneNumber,
            body: code
        }, function(err, message){
            if(err)
            {
                console.error(err.message);
            }
        });
       }
       else{
        res.send('fail')
       }
    }
    catch{
        res.status(500).send()
    }
})

app.post('/users/sms/', (req, res) => {
    const smsRetrive = sms.find(sms => sms.name === req.body.name)
    try{
        if(req.body.otp == smsRetrive.otp)
        {
            res.send('success')
        }
        else{
            res.send('wrong code please log in again')
        }
    }
    catch{
        res.status(500).send()
    }
})

app.listen(3000)

