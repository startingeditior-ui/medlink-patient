import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export const sendOTP = async (phone: string, otp: string): Promise<boolean> => {
  try {
    // Always log OTP for development
    console.log(`\n==========================================`);
    console.log(`📱 OTP for ${phone}: ${otp}`);
    console.log(`⏰ Expires in 5 minutes`);
    console.log(`==========================================\n`);

    if (!client || !twilioPhoneNumber) {
      console.log(`[INFO] Twilio not configured, using mock SMS`);
      return true;
    }

    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/\D/g, '')}`;

    const message = await client.messages.create({
      body: `Your MedLinkID verification code is: ${otp}. This code expires in 5 minutes.`,
      from: twilioPhoneNumber,
      to: formattedPhone
    });

    console.log(`✅ SMS sent successfully. SID: ${message.sid}`);
    return true;
  } catch (error: any) {
    console.error(`❌ SMS Error:`, error.message || error.code || error);
    
    if (error.code === 21608) {
      console.log(`[NOTE] Trial account - SMS only works to verified numbers`);
    }
    
    return true; // Return true so login continues
  }
};