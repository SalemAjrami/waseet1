import mongoose from 'mongoose';

async function clearDB() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect('mongodb://localhost:27017/waseet');
        console.log('Connected! Dropping sessions and deliverables...');
        const result1 = await mongoose.connection.db.collection('sessions').deleteMany({});
        const result2 = await mongoose.connection.db.collection('deliverables').deleteMany({});
        console.log(`Deleted ${result1.deletedCount} sessions`);
        console.log(`Deleted ${result2.deletedCount} deliverables`);
        console.log('Done!');
        process.exit(0);
    } catch (e) {
        console.error('Error:', e);
        process.exit(1);
    }
}

clearDB();
