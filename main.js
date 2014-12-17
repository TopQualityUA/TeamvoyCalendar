/* global require: true */
require.config({
    paths: {
        "moment": "moment/min/moment-with-locales",
        "calendar": "scripts/calendar",
        "date_range_picker": "scripts/date_range_picker"
    }
});
require(["calendar", "date_range_picker"],
    function(Calendar, DateRangePicker) {
        "use strict";

        new Calendar(document.getElementById("calendar-container"), {
            year: "2014",
            firstDayOfWeek: "Mon",
            locale: "en",
            weekends: ["Sat", "Sun"]
        });
        var _dateRangePicker = window.dateRangePicker = new DateRangePicker(document.getElementById("date-range-picker-container"));

        document.getElementById("range-start").value = _dateRangePicker.getRange().start;
        document.getElementById("range-end").value = _dateRangePicker.getRange().end;

        _dateRangePicker.on("rangeChanged", function(start, end) {
            document.getElementById("range-start").value = start;
            document.getElementById("range-end").value = end;
        });
    });
