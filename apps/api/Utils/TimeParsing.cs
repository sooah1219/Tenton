namespace Api.Utils;

using System.Globalization;

public static class TimeParsing
{
    public static int ToMinutes(string time12h)
    {
        var dt = DateTime.ParseExact(
            time12h.Trim(),
            "h:mm tt",
            CultureInfo.InvariantCulture
        );

        return dt.Hour * 60 + dt.Minute;
    }
}