const result = require('dotenv').config(); // The dotenv module will load a file named ".env"
import colors = require('colors');
colors.enabled = true;

function verify_file_exit(){
    if (result.error) {
        console.log("Unable to load \".env\" file. Please provide one to store the JWT_SECRET, PORT, MONGO_URL".red);
        return -1;
    }
    return 0;
}

const get_JWT_SECRET = () => {
    if(!verify_file_exit()){
        if (!process.env.JWT_SECRET) {
            console.log("\".env\" file loaded but JWT_SECRET value was not found".red);
            return "";
        }
        else{
            return process.env.JWT_SECRET;
        }
    }
    return "";
};

const get_MONGO_URL = () => {
    if(!verify_file_exit()){
        if (!process.env.MONGO_URL) {
            console.log("\".env\" file loaded but MONGO_URL value was not found".red);
            return "";
        }
        else{
            return process.env.MONGO_URL;
        }
    }
    return "";
};


const get_PORT = () => {
    if(!verify_file_exit()){
        if (!process.env.PORT) {
            console.log("\".env\" file loaded but PORT value was not found".red);
            return "";
        }
        else{
            return process.env.PORT;
        }
    }
    return "";
};


export const variables = {
    JWT_SECRET: get_JWT_SECRET(),
    MONGO_URL: get_MONGO_URL(),
    PORT: get_PORT(),
}


