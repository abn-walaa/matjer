let mongoose = require('mongoose');

// اتصال مع_ الداتا بيس
mongoose.connect(process.env.DBCONNECT)