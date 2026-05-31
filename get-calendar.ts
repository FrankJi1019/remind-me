import { calendar_v3, auth as googleAuth } from "@googleapis/calendar";
import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";

async function getParameters() {
  const ssmClient = new SSMClient();
  const response = await ssmClient.send(
    new GetParametersByPathCommand({
      Path: "/remind-me",
      WithDecryption: true,
    }),
  );

  if (!response.Parameters) {
    return {};
  }

  const params = response.Parameters?.map((parameter) => {
    return {
      name: parameter.Name?.split("/").pop(),
      value: parameter.Value,
    };
  }).reduce(
    (acc, curr) => {
      if (!(curr.name && curr.value)) {
        return acc;
      }
      acc[curr.name] = curr.value;
      return acc;
    },
    {} as Record<string, string>,
  );

  return params;
}

async function getGoogleCalendarEvents() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN } =
    await getParameters();

  const oauth2Client = new googleAuth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
  );
  oauth2Client.setCredentials({ refresh_token: GOOGLE_REFRESH_TOKEN });

  const calendar = new calendar_v3.Calendar({ auth: oauth2Client });

  const now = new Date();
  const oneMonthLater = new Date();
  oneMonthLater.setMonth(now.getMonth() + 1);

  const response = await calendar.events.list({
    calendarId: "primary",
    singleEvents: true,
    orderBy: "startTime",
    timeMin: now.toISOString(),
    timeMax: oneMonthLater.toISOString(),
  });

  const events = (response.data.items || []).map((event) => ({
    summary: event.summary || "",
    start: event.start?.dateTime || event.start?.date || "",
    end: event.end?.dateTime || event.end?.date || "",
  }));

  return events;
}

export { getGoogleCalendarEvents };
