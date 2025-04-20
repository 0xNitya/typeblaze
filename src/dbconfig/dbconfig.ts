import mongoose from "mongoose";

let isConnected = false;

export async function connectDb(): Promise<void> {
    try {
        // If already connected, return
        if (isConnected) {
            console.log("MongoDB connection already established");
            return;
        }

        // Check if MONGODB_URL is defined
        if (!process.env.MONGODB_URL) {
            throw new Error("MONGODB_URL is not defined in the environment variables");
        }

        // Connection options for better stability
        const options = {
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        };

        await mongoose.connect(process.env.MONGODB_URL, options);

        const connection = mongoose.connection;

        connection.on("connected", () => {
            isConnected = true;
            console.log("Connected to MongoDB successfully");
        });

        connection.on("error", (error: Error) => {
            console.log("Error connecting to MongoDB");
            console.error(error);
            isConnected = false;
        });

        connection.on("disconnected", () => {
            console.log("MongoDB disconnected");
            isConnected = false;
        });

        // Handle process termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });

    } catch (error: any) {
        console.log('Something went wrong while connecting to MongoDB');
        console.error(error);
        isConnected = false;
    }
}