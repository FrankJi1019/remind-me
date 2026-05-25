import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

const ses = new SESv2Client({ region: "ap-southeast-2" });

const FROM_EMAIL = "frankjishiyuan@gmail.com";
const TO_EMAIL = "frankjishiyuan@gmail.com";

export const handler = async (): Promise<{ statusCode: number; body: string }> => {
  await ses.send(new SendEmailCommand({
    FromEmailAddress: FROM_EMAIL,
    Destination: { ToAddresses: [TO_EMAIL] },
    Content: {
      Simple: {
        Subject: { Data: "Good morning! ☀️" },
        Body: { Text: { Data: "Good morning! ☀️" } }
      }
    }
  }));

  return { statusCode: 200, body: "Good morning sent!" };
};