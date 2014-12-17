/* global require: true */
require.config({
    paths: {
        "moment": "../../library/vendor/moment/min/moment-with-locales",
        "event_machine": "../../library/event_machine"
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
