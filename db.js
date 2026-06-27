const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://omondiopala_db_user:<@Asembo97>@cluster0.byivdzk.mongodb.net/?appName=Cluster0')
.then(() => console.log('MongoDB Atlas Connected'))
.catch(err => console.log(err));