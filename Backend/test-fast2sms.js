const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

async function testFast2Sms() {
    const FAST2SMS_API_KEY = process.env.FAST2SMS_API_KEY || process.env.FAST2SMS_KEY;
    console.log("Using API Key:", FAST2SMS_API_KEY ? "Loaded" : "Not Loaded");

    const otp = "1234";
    const numericPhone = "9999999999"; // Replace with a valid test number or use a dummy

    try {
        const response = await axios({
            method: 'post',
            url: 'https://www.fast2sms.com/dev/bulkV2',
            headers: {
                "authorization": FAST2SMS_API_KEY,
                "Content-Type": "application/json"
            },
            data: {
                "message": "Your OTP is " + otp,
                "language": "english",
                "route": "q",
                "numbers": numericPhone,
            }
        });
        
        console.log("Response:", response.data);
    } catch (error) {
        console.error("Error:", error.response ? error.response.data : error.message);
    }
}

testFast2Sms();
