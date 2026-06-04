import { PathNavigator } from "./PathNavigator"

export class Routes {
  public static DAILY_TASKS = new PathNavigator("/")
  public static EMAIL_PREVIEW = new PathNavigator("/email")
  public static SETTINGS = new PathNavigator("/settings")
}
