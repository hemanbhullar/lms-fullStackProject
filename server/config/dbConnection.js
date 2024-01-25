import mongoose from "mongoose";

mongoose.set('strictQuery', false); //Queryb  is not done in strict mode means if request you for extra information in case if you don't have extra info then you don't have to give any kind of error.

const connectionToDB =async () => {
    try{
        const { connection } = await mongoose.connect(
            process.env.MONGO_URL || `mongodb://127.0.0.1:27017/lms`
        );
    
        if (connection) {
            console.log(`Connected to MongoDB: ${connection.host}`);
        }
    }catch(err){
        console.log(err);
        process.exit(1);
    }
}

export default connectionToDB;