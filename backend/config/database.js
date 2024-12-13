import mongoose from "mongoose";

const uri = 'mongodb://127.0.0.1:27017/zbiorkolekcji';

const connectDB = async () => {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Połączono z MongoDB');
    } catch (err) {
        console.error(`Błąd połączenia z MongoDB: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;
