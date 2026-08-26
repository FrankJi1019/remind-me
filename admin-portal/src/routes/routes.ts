import { PathNavigator } from "./PathNavigator"

export class Routes {
  public static STATS = new PathNavigator("/stats")
  public static EMAIL_PREVIEW = new PathNavigator("/email")
  public static THEMES = new PathNavigator("/themes")
  public static LOGS = new PathNavigator("/logs")
  public static SETTINGS = new PathNavigator("/settings")
}
