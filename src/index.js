import dotenv from 'dotenv';
import connectDB from './db/index';
import { app } from './app';

dotenv.config({path: '../.env'});

connectDB()
.then(() => {  
    app.listen(process.env.PORT || 8000, () => {
        console.log("Server is running on Port: ", process.env.PORT);
    });
})
.catch((error) => { 
    console.log("Connection Failed!!  ", error);
});
