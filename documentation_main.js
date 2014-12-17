require.config({
    paths: {
        "moment": "../library/vendor/moment/min/moment-with-locales",
        "calendar": "../dist/scripts/calendar",
        "date_range_picker": "../dist/scripts/date_range_picker"
    }
});
require(["calendar", "date_range_picker"],
    function(Calendar, DateRangePicker) {
        "use strict";

        var firstCalendar, secondCalendar, fifthCalendar, sixthCalendar, seventhCalendar, eightsCalendar,
            firstContainer = document.getElementById("firstContainer"),
            secondContainer = document.getElementById("secondContainer"),
            fifthContainer = document.getElementById("fifthContainer"),
            sixthContainer = document.getElementById("sixthContainer"),
            seventhContainer = document.getElementById("seventhContainer"),
            eightsContainer = document.getElementById("eightsContainer");

        firstCalendar = new Calendar(firstContainer, {});
        secondCalendar = new Calendar(secondContainer, {
            year: 2014,
            month: 5,
            firstDayOfWeek: "Mon",
            locale: "uk",
            weekends: ["Sat", "Sun"]
        });
        fifthCalendar = new Calendar(fifthContainer, {
            year: 2014,
            month: 5,
            firstDayOfWeek: "Mon",
            locale: "en",
            weekends: ["Sat", "Sun"]
        });
        sixthCalendar = new Calendar(sixthContainer, {});
        seventhCalendar = new DateRangePicker(seventhContainer);
        eightsCalendar = new Calendar(eightsContainer, {
            year: 2014,
            month: 5,
            locale: "fr"
        });
        document.querySelector(".btn").onclick = function() {
            var newConfig = {};
            newConfig.year = document.querySelector(".year").value;
            newConfig.month = document.querySelector(".month").value;
            secondCalendar.setConfig(newConfig);
        };
    });